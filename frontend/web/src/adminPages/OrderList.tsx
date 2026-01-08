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
    order_status: string
    order_date: string
    order_updated_at: string
}

const OrderList: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, userInfo } = useSelector((state: any) => state.auth)
    const accessToken = useAccessToken(user)
    
    // Fixed: Should be OrderProp[] (array), not OrderProp
    const [orders, setOrders] = useState<OrderProp[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    
    // Fixed: Each order should have its own checked state
    const [checkedOrders, setCheckedOrders] = useState<Record<string, boolean>>({})
    
    useEffect(() => {
        if (!user || !user.access) {
            navigate("/login")
            return
        }
        if (user.access && !userInfo) {
            dispatch(getUserInfo() as any)
        }
    }, [user, userInfo, navigate, dispatch])
    
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
    
    const handleCheckChange = async (orderId: string, checked: boolean) => {
        setCheckedOrders(prev => ({
            ...prev,
            [orderId]: checked
        }))
        
        // Update order status in backend
        try {
            await api.patch(`shops/order-editor/${orderId}/`, {
                order_status: checked ? 'Completed' : 'Pending'
            })
        } catch (error) {
            console.error('Failed to update order:', error)
            // Revert checkbox on error
            setCheckedOrders(prev => ({
                ...prev,
                [orderId]: !checked
            }))
        }
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
                <Stack gap={3}>
                    {orders.map((o: OrderProp) => (
                        <Stack 
                            key={o.id} 
                            flexDirection="row" 
                            alignItems="flex-start"
                            p={"10px"}
                            border="1px solid"
                            borderColor="gray.200"
                            justifyContent={"space-between"}
                        >
                            <Box>
                                <Collapsible.Root>
                                    <Collapsible.Trigger 
                                        cursor="pointer" 
                                        fontSize="18px"
                                        fontWeight={checkedOrders[o.id] ? "normal" : "bold"}
                                        textDecoration={checkedOrders[o.id] ? "line-through" : "none"}
                                        color={checkedOrders[o.id] ? "gray.500" : "black"}
                                        mb={"10px"}
                                        >
                                            {o.order_number}
                                    </Collapsible.Trigger>
                                    <Collapsible.Content 
                                        p="10px" 
                                        border="1px solid" 
                                        borderColor="gray.200"
                                        rounded="7px"
                                    >
                                        <List.Root p={"20px"}>
                                            <List.Item>
                                                <Text fontWeight="semibold">Product: {o.product_name}</Text> 
                                            </List.Item>
                                            <List.Item>
                                                <Text fontWeight="semibold">Customer: {o.customer_name}</Text> 
                                            </List.Item>
                                            <List.Item>
                                                <Text fontWeight="semibold">Quantity: {o.quantity}</Text> 
                                            </List.Item>
                                            <List.Item>
                                                <Text fontWeight="semibold">Order Date: {formatDate(o.order_date)}</Text> 
                                            </List.Item>
                                            <List.Item>
                                                <Text fontWeight="semibold">Status: {o.order_status}</Text> 
                                            </List.Item>
                                        </List.Root>
                                    </Collapsible.Content>
                                </Collapsible.Root>
                            </Box>
                            
                            <Checkbox.Root 
                                checked={checkedOrders[o.id] || false}
                                onCheckedChange={(e) => handleCheckChange(o.id, !!e.checked)}
                            >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>Mark as Done</Checkbox.Label>
                            </Checkbox.Root>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    )
}

export default OrderList