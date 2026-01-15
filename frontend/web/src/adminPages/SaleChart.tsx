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
import useOrder from './OrderHook'
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
const SaleChart = () => {
    const {orders, loading, error} = useOrder()

    const unit = orders.find((o: OrderProp) => o.currency_unit)

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
        orderChart[month][product_name] += ord.quantity
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
    if (data.length === 0) return <div>No data available</div>

    return (
        <Box w={"100%"}>
            <Heading>Amount of products sold per month: </Heading>
            <Chart.Root w={{base:"100%", md: "100%"}} maxH={"sm"} chart={chart} border={"1px solid"} rounded={"5px"} p={"20px"}>
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
            <Stack gap={"10px"} flexDirection={{base:'column', md:'row'}}>
                <Box w={{base:"100%", md: "30%"}}>
                    <Heading>Top sales</Heading>
                    <BarList.Root  p={"10px"} chart={chartList} border={"1px solid"} rounded={"5px"}>
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
            </Stack>
        </Box>
    )
}
export default SaleChart
