import {useEffect, useState, useMemo} from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import {useSelector, useDispatch} from "react-redux"
import { useNavigate} from "react-router"
import useAccessToken from '@/services/token'
import { getUserInfo } from '@/services/authSlice'
import useOrder from './OrderHook'
import useShopAdmin from '../shop/ShopHookAdmin'

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
    order_date: string
    order_updated_at: string
    product_price: number
    order_total: number
    product_property: string
}

const OrderList: React.FC = () => {
    const navigate = useNavigate()
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const accessToken = useAccessToken(user)
    const [isDesktop, setIsDesktop] = useState<boolean>(false)
    const {shops} = useShopAdmin()
    const {orders, loading, error } = useOrder()
    
    const [openCustomerId, setOpenCustomerId] = useState<string>('')
    
    useEffect(() => {
        if(!user || !userInfo) {
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
    
    const groupedOrders = useMemo(() => {
        const grouped: { [key: string]: OrderProp[] } = {}
        orders
            .filter((ord: OrderProp) => ord.order_status === "Pending")
            .forEach((order: OrderProp) => {
                const customerKey = order.customer_name
                if(!grouped[customerKey]){
                    grouped[customerKey] = []
                }
                grouped[customerKey].push(order)
            })
        return grouped
    }, [orders])

    const pending_count = orders.filter((ord: OrderProp) => ord.order_status === "Pending").length
    const completed_count = orders.filter((ord: OrderProp) => ord.order_status === "Completed").length
    
    const toggleCustomerOrders = (customerName: string) => {
        setOpenCustomerId(openCustomerId === customerName ? '' : customerName)
    }
    
    return (
        <Box p={4}>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>Order List</Text>
            
            {loading && <Text>Loading orders...</Text>}
            
            {error && <Text color="red.500">{error}</Text>}
            
            {!loading && !error && orders.length === 0 && (
                <Text color="gray.500">No orders found</Text>
            )}
            
            {!loading && !error && orders.length > 0 && (
                <Box>
                    <Text>There are total {orders.length} orders</Text>
                    
                    {/* Completed Orders */}
                    <Box>
                        <Text>There are <strong>{completed_count}</strong> completed orders: </Text>
                        {orders
                            .filter((ord: OrderProp) => ord.order_status === "Completed")
                            .map((ord: OrderProp) => (
                                <Box key={ord.id}>
                                    <Text>{ord.order_number}</Text>
                                </Box>
                            ))
                        }
                    </Box>
                
                    <Box>
                        <Text>There are <strong>{pending_count}</strong> incomplete orders: </Text>
                    </Box>
                    {Object.keys(groupedOrders).length > 0 ? (
                        <Box>
                            {Object.entries(groupedOrders).map(([customerName, orderDetails]: [string, OrderProp[]]) => (
                                <Box key={customerName} onClick={() => toggleCustomerOrders(customerName)}>
                                    <Heading cursor={"pointer"} _hover={{color:"blue", textDecoration:"underline"}}>{customerName}</Heading>
                                    <Box>
                                        {openCustomerId === customerName && (
                                            <Box>
                                                {orderDetails.map((ord: OrderProp) => (
                                                    <Box key={ord.id}>
                                                        <Heading color={"red.500"}>Order#: {ord.order_number}</Heading>
                                                        <Text pl={"20px"}>Name: {ord.product_name}</Text> 
                                                        <Text pl={"20px"}>Unit Price: {ord.product_price}</Text> 
                                                        <Text pl={"20px"}>Quantity: {ord.quantity}</Text> 
                                                        <Text pl={"20px"}>Total Price: {ord.order_total}</Text> 
                                                        <Text pl={"10px"} fontWeight={"bold"}>Details of Product: </Text>
                                                        <Text pl={"20px"} whiteSpace={"pre-line"}>{ord.product_property}</Text> 
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                            
                        </Box>
                    ):("")

                    }     
                </Box>
            )}
        </Box>
    )
}

export default OrderList