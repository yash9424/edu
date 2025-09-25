"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

interface AgencyStats {
  totalApplications: number
  successfulApplications: number
  pendingApplications: number
  rejectedApplications: number
  monthlyGrowth: number
}

const initialStats: AgencyStats = {
  totalApplications: 0,
  successfulApplications: 0,
  pendingApplications: 0,
  rejectedApplications: 0,
  monthlyGrowth: 0,
}

export function ApplicationStats() {
  const [stats, setStats] = useState<AgencyStats>(initialStats)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    fetch('/api/agency/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalApplications: data.totalApplications || 0,
          successfulApplications: data.successfulApplications || 0,
          pendingApplications: data.pendingApplications || 0,
          rejectedApplications: data.rejectedApplications || 0,
          monthlyGrowth: data.monthlyGrowth || 0,
        })
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching stats:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 3 seconds for real-time updates
    const interval = setInterval(fetchStats, 3000)
    return () => clearInterval(interval)
  }, [])

  // Listen for real-time updates
  useRealTimeUpdates({
    types: ['application', 'payment'],
    onUpdate: () => {
      // Refresh stats when applications or payments are updated
      fetch('/api/agency/stats')
        .then(res => res.json())
        .then(data => {
          setStats({
            totalApplications: data.totalApplications || 0,
            successfulApplications: data.successfulApplications || 0,
            pendingApplications: data.pendingApplications || 0,
            rejectedApplications: data.rejectedApplications || 0,
            monthlyGrowth: data.monthlyGrowth || 0,
          })
        })
        .catch(error => console.error('Error refreshing stats:', error))
    }
  })

  // Use stats from API
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.totalApplications}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary">+{loading ? '...' : stats.monthlyGrowth}% this month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.pendingApplications}</div>
          <p className="text-xs text-muted-foreground">Awaiting admin review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.successfulApplications}</div>
          <p className="text-xs text-muted-foreground">Successfully approved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.rejectedApplications}</div>
          <p className="text-xs text-muted-foreground">Need revision</p>
        </CardContent>
      </Card>
    </div>
  )
}
