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
const SaleBarChart = () => {
    const {orders, loading, error} = useOrder()

    // const unit = orders.find((o: OrderProp) => o.currency_unit)

    const orderChart: {[month: string]: {[product: string]: number}} = {}
    orders.forEach((ord: OrderProp) => {
        const date = new Date(ord.order_date || ord.order_updated_at)
        const month = date.toLocaleDateString('en-FI', {month: 'long', year: 'numeric' })
        const product_name = ord.product_name
        if(!orderChart[month]){
            orderChart[month] = {}
        }
        if (!orderChart[month][product_name]){
            orderChart[month][product_name] = 0
        }
        if (ord.order_status === "Completed"){
            orderChart[month][product_name] += ord.quantity
        }
    })
    const allProducts = Array.from(
        new Set(orders.map(ord => ord.product_name))
    )
    const data = Object.keys(orderChart).map(month => {
        const monthData: any = { month }
        allProducts.forEach(product => {
            monthData[product] = orderChart[month][product] || 0
        })
        return monthData
    })
    data.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    const colors = ["teal.solid", "purple.solid", "blue.solid", "orange.solid", "pink.solid", "green.solid"]

    const series = allProducts.map((product, index) => ({
        name: product,
        color: colors[index % colors.length]
    }))
    const chart = useChart({
        data: data,
        series: series
    })

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error loading orders</div>
    if (data.length === 0) return <div>No product was sold so far</div>

    return (
        <Box shadow={"sm"} rounded={"5px"} px={"10px"}>
            <Heading py={"20px"} textAlign={"center"} fontSize={{base:'14px', md:"18px"}}>Quantity of products sold per month: </Heading>
            <Chart.Root chart={chart} h={"500px"}>
                <BarChart data={chart.data} barGap={5}>
                    <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
                    <XAxis
                        axisLine={true}
                        tickLine={false}
                        dataKey={chart.key("month")}
                        tickFormatter={(value) => value.split(' ')[0]}
                        padding={{ left: 10, right: 10 }}

                    />
                    <YAxis
                        axisLine={true}
                        tickLine={false}
                        label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft'}}
                    />
                    <Tooltip
                        cursor={{ fill: chart.color("bg.muted") }}
                        animationDuration={100}
                        content={<Chart.Tooltip />}
                    />
                    <Legend content={<Chart.Legend />} />
                    {chart.series.map((item) => (
                        <Bar
                            isAnimationActive={false}
                            key={String(item.name)}
                            dataKey={chart.key(String(item.name))}
                            fill={chart.color(item.color)}
                            stroke={chart.color(item.color)}
                            stackId={item.stackId}
                            // barSize={35}

                        >
                            <LabelList
                                dataKey={chart.key(String(item.name))}
                                position="top"
                                style={{ fontWeight: "600", fill: chart.color("fg") }}
                            />
                        </Bar>
                    ))}
                </BarChart>
            </Chart.Root>
        </Box>
    )
}
export default SaleBarChart
