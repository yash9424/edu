'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { AdminCharts } from "@/components/admin/admin-charts"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"

interface User {
  name: string
  role: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (!data || data.role !== 'admin') {
          router.push('/login')
        } else {
          setSession(data)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AdminHeader 
        title="Admin Dashboard" 
        subtitle={`Welcome back, ${session.name}`} 
        showBack={false} 
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Stats Overview */}
          <AdminStats />

          {/* Charts and Analytics */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AdminCharts />
            </div>
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
