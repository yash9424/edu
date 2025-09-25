'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface PaymentStats {
  totalRevenue: number
  totalPayments: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  monthlyGrowth: number
  averagePayment: number
  totalCommissions: number
}

// Initial stats state
const initialStats: PaymentStats = {
  totalRevenue: 0,
  totalPayments: 0,
  pendingPayments: 0,
  completedPayments: 0,
  failedPayments: 0,
  monthlyGrowth: 0,
  averagePayment: 0,
  totalCommissions: 0,
}

export function PaymentStats() {
  const [paymentStats, setPaymentStats] = useState<PaymentStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = () => {
    fetch('/api/admin/payments/stats')
      .then(res => res.json())
      .then(data => {
        setPaymentStats(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching payment stats:', error)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Listen for real-time updates
  useRealTimeUpdates({
    types: ['payment'],
    onUpdate: (event) => {
      // Refresh payment stats when a payment is created, updated, or deleted
      fetch('/api/admin/payments/stats')
        .then(res => res.json())
        .then(data => setPaymentStats(data))
        .catch(error => console.error('Error refreshing payment stats:', error))
    }
  })
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{paymentStats.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary">+{paymentStats.monthlyGrowth}% this month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentStats.totalPayments}</div>
          <p className="text-xs text-muted-foreground">Avg: ₹{paymentStats.averagePayment}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentStats.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">Awaiting processing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commissions</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{paymentStats.totalCommissions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total earned</p>
        </CardContent>
      </Card>
    </div>
  )
}
