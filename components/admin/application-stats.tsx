'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle, Eye, TrendingUp } from "lucide-react"
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  underReview: number
  thisMonth: number
  lastMonth: number
  growthRate: number
}

// Initial stats state
const initialStats: ApplicationStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  underReview: 0,
  thisMonth: 0,
  lastMonth: 0,
  growthRate: 0,
}

export function ApplicationStats() {
  const [applicationStats, setApplicationStats] = useState<ApplicationStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch application stats
    fetch('/api/admin/applications/stats')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        // Ensure we have valid data before updating state
        if (data && typeof data.total === 'number') {
          setApplicationStats(data)
        } else {
          console.error('Invalid stats data received:', data)
          setApplicationStats(initialStats)
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching application stats:', error)
        setApplicationStats(initialStats)
        setIsLoading(false)
      })
  }, [])
  
  const refreshStats = () => {
    fetch('/api/admin/applications/stats')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data && typeof data.total === 'number') {
          setApplicationStats(data)
        }
      })
      .catch(error => {
        console.error('Error refreshing application stats:', error)
      })
  }

  // Refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshStats, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const growthPercentage = applicationStats.lastMonth > 0 ?
    (((applicationStats.thisMonth - applicationStats.lastMonth) / applicationStats.lastMonth) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationStats.total.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+{growthPercentage}% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationStats.pending}</div>
          <Badge variant="secondary" className="text-xs mt-1">
            Needs attention
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{applicationStats.approved}</div>
          <p className="text-xs text-muted-foreground">
            {((applicationStats.approved / applicationStats.total) * 100).toFixed(1)}% approval rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{applicationStats.underReview}</div>
          <p className="text-xs text-muted-foreground">In progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{applicationStats.rejected}</div>
          <p className="text-xs text-muted-foreground">
            {((applicationStats.rejected / applicationStats.total) * 100).toFixed(1)}% rejection rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
