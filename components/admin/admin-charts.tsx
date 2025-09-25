"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Pie, PieChart, XAxis, YAxis, Cell } from "recharts"

interface ApplicationData {
  month: string
  applications: number
}

interface PaymentStatusData {
  name: string
  value: number
  color: string
}

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--chart-1))",
  },
  paid: {
    label: "Paid",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-3))",
  },
}

export function AdminCharts() {
  const [applicationData, setApplicationData] = useState<ApplicationData[]>([])
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const fetchChartData = () => {
    // Fetch application data
    fetch('/api/admin/applications/chart-data')
      .then(res => res.json())
      .then(data => {
        setApplicationData(data.applicationData)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching application chart data:', error)
        setIsLoading(false)
      })
      
    // Fetch payment status data
    fetch('/api/admin/payments/chart-data')
      .then(res => res.json())
      .then(data => {
        const formattedData = [
          { name: "Paid", value: data.paid || 0, color: "hsl(var(--chart-1))" },
          { name: "Pending", value: data.pending || 0, color: "hsl(var(--chart-2))" },
          { name: "Failed", value: data.failed || 0, color: "hsl(var(--chart-3))" },
        ]
        setPaymentStatusData(formattedData)
      })
      .catch(error => console.error('Error fetching payment chart data:', error))
  }

  useEffect(() => {
    fetchChartData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchChartData, 30000)
    
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Applications Over Time</CardTitle>
          <CardDescription>Monthly application submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={applicationData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="var(--color-applications)"
                strokeWidth={2}
                dot={{
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Payment Status Distribution</CardTitle>
          <CardDescription>Current payment status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}