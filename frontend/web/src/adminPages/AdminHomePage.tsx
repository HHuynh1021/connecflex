import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import useAccessToken from '@/services/token'
import { getUserInfo} from '@/services/authSlice'
import { Box, Grid, Heading, HStack, List, Span, Stack, Text, VStack, Wrap } from '@chakra-ui/react'
import type { AppDispatch } from '@/services/store'
import useShopAdmin from '@/components/shop/ShopHookAdmin'
import CreateNewShop from '@/components/shop/CreateNewShop'
import useOrder from '../components/orders/OrderHook'
import { LuCircleCheck } from 'react-icons/lu'
import SaleBarChart from '@/components/shop/SaleBarChart'
import SaleBarList from '@/components/shop/SaleBarList'
import OrderList from '@/components/orders/OrderList'
import ShopInfo from './ShopInfo'
import MonthlySaleBarList from '@/components/shop/MonthlySaleBarList'

interface OrderProp {
    id: string
    product: string
    shop: string
    customer: string
    quantity: number
    shop_name: string
    product_name: string
    customer_name: string
    order_number: string
    order_status: string
    order_total: number
    order_date: string
    order_updated_at: string
    currency_unit: string
    customer_email: string
    customer_phone: string
    customer_address: string
    product_property: string
    product_price: number
}
interface ShopDataProps {
    id: string
    name: string
    email: string
    street: string
    province: string
    city: string
    state: string
    zipcode: string
    country: string
    phone: string
    description: string
    industry: string
    logo: string
    banner: string;
    template: string;
}
const AdminHomePage = () => {
    const navigate = useNavigate()
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const accessToken = useAccessToken(user)
    const [isDesktop, setIsDesktop] = useState<boolean>(false)
    const {shops} = useShopAdmin()
    const {orders, loading, error } = useOrder()
    
    const [openCustomerId, setOpenCustomerId] = useState<string>('')
    
    useEffect(() => {
        if(!user || !userInfo || !accessToken) {
            navigate("/login")
        }
        if (user.access && !userInfo) {
            dispatch(getUserInfo() as any)
        }
    },[user, userInfo, navigate, dispatch])
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 450px)')
        const handleSize = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
        mediaQuery.addEventListener('change', handleSize)
        handleSize(mediaQuery as any)
        return () => mediaQuery.removeEventListener('change', handleSize)
    },[])
    // console.log("shops: ", shops)
    const shop_name = shops.find((s: ShopDataProps) => s.name.length > 0)
    return (
        <Box>
            {!shop_name ? (
                <ShopInfo/>
            ) : (
                <VStack w={"100%"} my={'20px'}>
                    <VStack w={"100%"} gap={"20px"}>
                        <Box w={"100%"}>
                            <SaleBarChart/>
                        </Box>
                        <Box w={"100%"}>
                            <SaleBarList/>
                        </Box>
                        <Box w={"100%"}>
                            <MonthlySaleBarList/>
                        </Box>
                    </VStack>
                </VStack>
            )}
        </Box>
    )
}

export default AdminHomePage