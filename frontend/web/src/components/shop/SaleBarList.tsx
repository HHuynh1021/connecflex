import React from 'react'
import { BarList, type BarListData, Chart, useChart } from "@chakra-ui/charts"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ResponsiveContainer } from "recharts"
import useOrder from '../orders/OrderHook'
import { Box, Heading, Stack } from '@chakra-ui/react'
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
const SaleBarList = () => {
    const {orders, loading, error} = useOrder()

    const unit = orders.find((o: OrderProp) => o.currency_unit)

//Chartlist display the top sale of products: 
    const orderTopSale: {[product: string]: number} = {}
    orders.forEach((ord: OrderProp) => {
        const product_name = ord.product_name
        if (!orderTopSale[product_name]) {
            orderTopSale[product_name] = 0
        }
        orderTopSale[product_name] += Number(ord.order_total)
    })

    const dataList = Object.entries(orderTopSale)
        .map(([product, total]) => ({
            name: product,
            value: Number(total)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

    const chartList = useChart<BarListData>({
        sort: { by: "value", direction: "desc" },
        data: dataList,
        series: [{name: 'name', color: "teal.subtle"}]
    })

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error loading orders</div>
    if (dataList.length === 0) return <div>No data available</div>

    return (
        <Box>
            <Heading p={"20px"} textAlign={"center"} fontSize={{base:'14px', md:"18px"}}>Top-selling products by revenue</Heading>
            <BarList.Root p={"20px"} my={"10px"} chart={chartList} shadow={"2xl"} rounded={"5px"}>
                <BarList.Content>
                    <BarList.Label title="Products" flex="1">
                        <BarList.Bar/>
                    </BarList.Label>
                    <BarList.Label title="Total Amount" titleAlignment="end">
                        <BarList.Value valueFormatter={(value) => value.toLocaleString()}/>
                    </BarList.Label>                        
                </BarList.Content>
            </BarList.Root>
        </Box>
    )
}
export default SaleBarList
