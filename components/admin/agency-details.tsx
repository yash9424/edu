"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, MapPin, Calendar, DollarSign, FileText } from "lucide-react"
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates'

interface Agency {
  id: string
  name: string
  email: string
  phone: string
  contactPerson: string
  address: string
  commissionRate: number
  status: string
  totalApplications?: number
  totalRevenue?: number
  createdAt: string
  description?: string
  joinedDate: string
}

interface AgencyDetailsProps {
  agencyId: string
}

export function AgencyDetails({ agencyId }: AgencyDetailsProps) {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch agency details with AbortController for cleanup
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    
    setIsLoading(true)
    
    fetch(`/api/admin/agencies/${agencyId}`, { signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setAgency(data.agency || data)
        setIsLoading(false)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching agency details:', error)
          setIsLoading(false)
        }
      })
      
    return () => {
      controller.abort()
    }
  }, [agencyId])
  
  // Listen for real-time updates with improved error handling and built-in debouncing
  useRealTimeUpdates({
    types: ['agency'],
    debounceMs: 500, // Increased debounce time for better performance
    enabled: !!agencyId, // Only enable when we have an agencyId
    onUpdate: (event) => {
      if (event.type === 'agency' && event.data && event.data.id === agencyId) {
        // Set loading state to true to show loading indicator
        setIsLoading(true)
        
        // Refresh agency data with AbortController for cleanup
        const controller = new AbortController()
        const signal = controller.signal
        
        fetch(`/api/admin/agencies/${agencyId}`, { signal })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Error ${res.status}: ${res.statusText}`)
            }
            return res.json()
          })
          .then(data => {
            setAgency(data.agency || data)
            setIsLoading(false)
          })
          .catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error refreshing agency details:', error)
              setIsLoading(false)
            }
          })
      }
    }
  })

  // Render skeleton UI during loading for better perceived performance
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    )
  }
  
  if (!agency) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Agency not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">


      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{agency.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{agency.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground text-pretty">{agency.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Joined Date</p>
                <p className="text-sm text-muted-foreground">{agency.createdAt || agency.joinedDate ? new Date(agency.createdAt || agency.joinedDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-primary">{agency.totalApplications || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">₹{agency.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-primary rounded-full" />
              <div>
                <p className="font-medium">Commission Rate</p>
                <p className="text-2xl font-bold text-primary">{agency.commissionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Recent applications will be displayed here</p>
            <p className="text-sm">This will be implemented in the Student Application System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
