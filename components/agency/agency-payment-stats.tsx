'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from 'react'


interface AgencyStats {
  totalPayments: number
  monthlyPayments: number
  monthlyGrowth: number
  totalApplications: number
  approvedPayments: number
}

const initialStats: AgencyStats = {
  totalPayments: 0,
  monthlyPayments: 0,
  monthlyGrowth: 0,
  totalApplications: 0,
  approvedPayments: 0,
}

export function AgencyPaymentStats() {
  const [stats, setStats] = useState<AgencyStats>(initialStats)

  useEffect(() => {
    // Fetch initial stats
    fetch('/api/agency/payment-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching stats:', error))
  }, [])

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/agency/payment-stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(error => console.error('Error fetching stats:', error))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{(stats.totalPayments || 0).toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary">+{stats.monthlyGrowth || 0}% this month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications || 0}</div>
          <p className="text-xs text-muted-foreground">Applications submitted</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{(stats.monthlyPayments || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Payments this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Payments</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedPayments || 0}</div>
          <p className="text-xs text-muted-foreground">Payments approved</p>
        </CardContent>
      </Card>
    </div>
  )
}
