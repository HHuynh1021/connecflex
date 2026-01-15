import {useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useAccessToken from '@/services/token'
import { getUserInfo } from '@/services/authSlice'
import api from '@/services/api'
import { Box, } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { useNavigate } from 'react-router'

interface OrderProp {
    product: string;
    shop: string
    customer: string
    shop_name: string
    product_name: string
    customer_name: string
    order_number: string
    order_status: string
    order_data: string
    order_updated_at: string
    customer_address: string
    customer_contact: string
    currency_unit: string

}
const CreateOrder = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, userInfo } = useSelector((state: any) => state.auth)
    const accessToken = useAccessToken(user)
    const [orders, setOrders] = useState<OrderProp>([])

    useEffect(() => {
        if (!user || !user.access) {
        navigate("/login");
        return;
        }
    
        if (user.access && !userInfo) {
        // console.log('Fetching user info with token:', user.access.substring(0, 20) + '...');
        dispatch(getUserInfo() as any);
        }
    }, [user, userInfo, navigate, dispatch]);

    const generateRandomString = () => {
        // const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        
        let result = '';
        
        // Generate 3 random characters
        // for (let i = 0; i < 3; i++) {
        //     result += characters.charAt(Math.floor(Math.random() * characters.length));
        // }
        
        // Generate 8 random numbers

        for (let i = 0; i < 8; i++) {
            result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return result;
    };
    useEffect(()=> {
        const order_number = generateRandomString()
        console.log("order_number: ", order_number)
    })
    const [formData, setFormData] = useState({
        product: "",
        shop: "",
        customer: "",
        shop_name: "",
        product_name: "",
        customer_name: "",
        order_number: "",
        order_status: "",
        order_data: "",
        order_updated_at: "",
        currency_unit: "",
        customer_contact: "",
        customer_address: ""
    })
    const buyProducts = async() => {
        const url = `${import.meta.env.VITE_API_BASE_URL}/shops/order-create/`
            
        try {
            await api.post(url, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
            toaster.create({
                title: 'Success',
                description: `Product ${orders.product_name} added successfully`,
                type: 'success',
                duration: 3000,
            })
            setFormData({
                product: "",
                shop: "",
                customer: "",
                shop_name: "",
                product_name: "",
                customer_name: "",
                order_number: "",
                order_status: "",
                order_data: "",
                order_updated_at: "",
                currency_unit: "",
                customer_contact: "",
                customer_address: "",
            })
        }catch(error: any){
            console.error("buyProduct error", error.response.data || error.message)
        }
    }
  return (
    <Box>

    </Box>
  )
}

export default CreateOrder