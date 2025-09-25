"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

interface Application {
  id: string
  studentName: string
  collegeName: string
  courseName: string
  status: string
  submittedAt: string
  fees: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "default"
    case "pending":
      return "secondary"
    case "under_review":
      return "outline"
    case "rejected":
      return "destructive"
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

export function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch applications data
  const fetchApplications = async () => {
    try {
      setError(null)
      const response = await fetch('/api/agency/applications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`)
      }

      const data = await response.json()
      
      // Get the 3 most recent applications
      const recentApps = data
        .sort((a: any, b: any) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
        .slice(0, 3)
        .map((app: any) => ({
          id: app.id || app._id,
          studentName: app.studentName,
          collegeName: app.collegeName,
          courseName: app.courseName,
          status: app.status,
          submittedAt: app.submittedAt,
          fees: app.fees || 0
        }))
      
      setApplications(recentApps)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  // Subscribe to real-time updates
  useRealTimeUpdates({
    types: ['application'],
    debounceMs: 300,
    enabled: true,
    onUpdate: () => {
      fetchApplications()
    }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/agency/applications">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading applications...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/agency/applications">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchApplications}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="/agency/applications">View All</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No recent applications found</p>
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(application.studentName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-balance">{application.studentName}</h4>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {application.courseName} at {application.collegeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant={getStatusColor(application.status)}>{application.status.replace("_", " ")}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">${application.fees}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/agency/applications/${application.id}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
