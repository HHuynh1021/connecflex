import {useEffect, useState} from 'react'
import { Box, Checkbox, Collapsible, List, Stack, Text } from '@chakra-ui/react'
import {useSelector, useDispatch} from "react-redux"
import { useNavigate} from "react-router"
import useAccessToken from '@/services/token'
import { getUserInfo } from '@/services/authSlice'
import api from '@/services/api'
import formatDate from '@/components/formatDate'

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
    order_total: number
    order_status: string
    order_date: string
    order_updated_at: string
    currency_unit: string
    customer_email: string
    customer_phone: string
    customer_address: string
    product_property: string
    product_price: number
}

const useOrder = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state: any) => state.auth)
    const accessToken = useAccessToken(user)
    
    const [orders, setOrders] = useState<OrderProp[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const fetchOrder = async () => {
            setLoading(true)
            setError('')
            
            if (!accessToken) {
                navigate("/login")
                return
            }
            
            try {
                const url = "shops/order-list-view/"
                const response = await api.get(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                
                const data = response.data
                console.log("order data:", data)
                setOrders(data)
            } catch (error: any) {
                console.error("fetch order error:", error.response?.data || error.message)
                setError(error.response?.data?.detail || "Failed to fetch orders")
            } finally {
                setLoading(false)
            }
        }
        
        useEffect(() => {
            if (accessToken) {
                fetchOrder()
            }
        }, [accessToken])

  return {orders, loading, error}
}

export default useOrder