import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const applications = await Application.find({})
    
    const total = applications.length
    const pending = applications.filter(app => app.status === 'pending').length
    const approved = applications.filter(app => app.status === 'approved').length
    const rejected = applications.filter(app => app.status === 'rejected').length
    const underReview = applications.filter(app => app.status === 'processing').length
    
    // Calculate monthly stats
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const thisMonthApps = applications.filter(app => 
      new Date(app.createdAt) >= thisMonth
    ).length
    
    const lastMonthApps = applications.filter(app => {
      const appDate = new Date(app.createdAt)
      return appDate >= lastMonth && appDate < thisMonth
    }).length
    
    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      underReview,
      thisMonth: thisMonthApps,
      lastMonth: lastMonthApps,
      growthRate: lastMonthApps > 0 ? ((thisMonthApps - lastMonthApps) / lastMonthApps) * 100 : 0
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}