'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, FileText, CreditCard, TrendingUp } from "lucide-react"
import { useState, useEffect } from 'react'
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface Stats {
  totalAgencies: number
  totalColleges: number
  totalApplications: number
  totalPayments: number
  totalUsers: number
  activeUsers: number
  agencyUsers: number
  monthlyGrowth: number
  pendingApplications: number
}

// Initial stats state
const initialStats: Stats = {
  totalAgencies: 0,
  totalColleges: 0,
  totalApplications: 0,
  totalPayments: 0,
  totalUsers: 0,
  activeUsers: 0,
  agencyUsers: 0,
  monthlyGrowth: 0,
  pendingApplications: 0,
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>(initialStats)

  useEffect(() => {
    // Fetch initial stats
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching stats:', error))
  }, [])

  useRealTimeUpdates({
    types: ['application', 'payment', 'agency', 'college', 'user'],
    onUpdate: (event) => {
      setStats(prevStats => {
        const newStats = { ...prevStats }
        
        switch (event.type) {
          case 'application':
            if (event.action === 'create') {
              newStats.totalApplications++
              if (event.data.status === 'pending') {
                newStats.pendingApplications++
              }
            } else if (event.action === 'delete') {
              newStats.totalApplications = Math.max(0, newStats.totalApplications - 1)
              if (event.data.status === 'pending') {
                newStats.pendingApplications = Math.max(0, newStats.pendingApplications - 1)
              }
            }
            break
          case 'agency':
            if (event.action === 'create') {
              newStats.totalAgencies++
            } else if (event.action === 'delete') {
              newStats.totalAgencies = Math.max(0, newStats.totalAgencies - 1)
            }
            break
          case 'college':
            if (event.action === 'create') {
              newStats.totalColleges++
            } else if (event.action === 'delete') {
              newStats.totalColleges = Math.max(0, newStats.totalColleges - 1)
            }
            break
          case 'payment':
            if (event.action === 'create') {
              newStats.totalPayments++
            } else if (event.action === 'delete') {
              newStats.totalPayments = Math.max(0, newStats.totalPayments - 1)
            }
            break
          case 'user':
            if (event.action === 'create') {
              newStats.totalUsers++
              if (event.data.status === 'active') {
                newStats.activeUsers++
              }
              if (event.data.role === 'Agency') {
                newStats.agencyUsers++
              }
            } else if (event.action === 'update') {
              // Handle status changes
              if (event.data.status === 'active' && event.data._previousStatus === 'inactive') {
                newStats.activeUsers++
              } else if (event.data.status === 'inactive' && event.data._previousStatus === 'active') {
                newStats.activeUsers = Math.max(0, newStats.activeUsers - 1)
              }
            } else if (event.action === 'delete') {
              newStats.totalUsers = Math.max(0, newStats.totalUsers - 1)
              if (event.data.status === 'active') {
                newStats.activeUsers = Math.max(0, newStats.activeUsers - 1)
              }
              if (event.data.role === 'Agency') {
                newStats.agencyUsers = Math.max(0, newStats.agencyUsers - 1)
              }
            }
            break
        }
        
        return newStats
      })
    }
  })
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.activeUsers} active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAgencies}</div>
          <p className="text-xs text-muted-foreground">Active partners</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalColleges}</div>
          <p className="text-xs text-muted-foreground">Partner institutions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.pendingApplications} pending
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPayments}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary">+{stats.monthlyGrowth}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
