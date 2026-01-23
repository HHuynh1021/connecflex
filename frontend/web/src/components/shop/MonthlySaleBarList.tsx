import { Chart, useChart } from "@chakra-ui/charts"
import useOrder from '../orders/OrderHook'
import { Box, Heading } from '@chakra-ui/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts"

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
    monthly_sales: number
}

const MonthlySaleBarChart = () => {
    const {orders, loading, error} = useOrder()
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    const unit = orders.map((ord: OrderProp) => ord.currency_unit)[0]
    const allMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    // Initialize sales objects
    const currentYearSales: Record<string, number> = {}
    const previousYearSales: Record<string, number> = {}
    
    allMonths.forEach((month) => {
        currentYearSales[month] = 0
        previousYearSales[month] = 0
    })
    
    // Populate sales data
    orders.forEach((ord: OrderProp) => {
        const date = new Date(ord.order_date || ord.order_updated_at)
        const orderYear = date.getFullYear()
        const month = date.toLocaleDateString('en-US', {month: 'long'})

        if (orderYear === currentYear) {
            currentYearSales[month] += Number(ord.monthly_sales)
        } else if (orderYear === previousYear) {
            previousYearSales[month] += Number(ord.monthly_sales)
        }
    })
    console.log('Current Year Sales:', currentYearSales)
    console.log('Previous Year Sales:', previousYearSales)
    // Create chart data - key names must match series names
    const chartData = allMonths.map((month) => ({
        month: month,
        previousYear: Number(previousYearSales[month]) || 0,
        currentYear: Number(currentYearSales[month]) || 0
    }))
    
    const chart = useChart({
        data: chartData,
        series: [
            { name: "previousYear", label: `Previous Year (${previousYear})`, color: "blue.solid" },
            { name: "currentYear", label: `Current Year (${currentYear})`, color: "orange.focusRing" }
        ],
    })
        
    return (
        <Box shadow={"sm"} rounded={"5px"} px={"10px"}>
            <Heading textAlign="center" py={"20px"}>
                Monthly Revenue Comparison
            </Heading>
            <Chart.Root h={"500px"} chart={chart}>
                <BarChart data={chart.data}>
                    <CartesianGrid 
                        stroke={chart.color("border.muted")} 
                        vertical={false} 
                    />
                    <XAxis
                        axisLine={true}
                        tickLine={false}
                        dataKey={chart.key("month")}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        axisLine={true}
                        tickLine={false}
                        label={{ value: `Revenue in ${unit}`, angle: -90, position: 'insideLeft'}}
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
                            key={item.name}
                            dataKey={chart.key(item.name)}
                            fill={chart.color(item.color)}
                            stroke={chart.color(item.color)}
                        >
                            <LabelList
                                dataKey={chart.key(item.name)}
                                position="top"
                                style={{ 
                                    fontWeight: "600", 
                                    fill: chart.color("fg") 
                                }}
                            />
                        </Bar>
                    ))}
                </BarChart>
            </Chart.Root>
        </Box>
    )
}

export default MonthlySaleBarChart