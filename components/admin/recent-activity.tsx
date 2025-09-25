'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface Activity {
  id: string | number
  type: string
  message: string
  user: string
  timestamp: Date
  status: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivities = () => {
    fetch('/api/admin/activities')
      .then(res => res.json())
      .then(data => {
        const formattedActivities = data.map((activity: any) => ({
          ...activity,
          timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date()
        }))
        setActivities(formattedActivities)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching recent activities:', error)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchActivities()
    
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [])
  
  // Listen for real-time updates
  useRealTimeUpdates({
    types: ['application', 'payment', 'agency', 'college', 'user'],
    onUpdate: (event) => {
      // Create a new activity from the event data
      const newActivity: Activity = {
        id: `${event.type}-${Date.now()}`,
        type: event.type,
        message: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} ${event.action}d`,
        user: event.data.studentName || event.data.name || event.data.username || 'System',
        timestamp: new Date(),
        status: event.data.status || 'info'
      }
      
      // Add new activity at the top of the list
      setActivities(prev => [
        newActivity,
        ...prev.slice(0, 4) // Keep only the 5 most recent activities
      ])
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "completed":
      case "approved":
        return "default"
      case "new":
        return "secondary"
      case "updated":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No recent activities</div>
          ) : activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{getInitials(activity.user)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-pretty">{activity.message}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(activity.status)} className="text-xs">
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp instanceof Date && !isNaN(activity.timestamp.getTime())
                      ? formatDistanceToNow(activity.timestamp, { addSuffix: true })
                      : 'recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
