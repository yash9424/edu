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
    
    // Get recent applications
    const recentApplications = await Application.find({})
      .sort({ createdAt: -1 })
      .limit(10)
    
    // Convert to activity format
    const activities = recentApplications.map(app => ({
      id: app._id,
      type: 'application',
      message: `New application submitted by ${app.studentName} for ${app.courseName}`,
      user: app.studentName,
      timestamp: app.createdAt,
      status: app.status
    }))
    
    // Add some mock activities for variety
    const mockActivities = [
      {
        id: 'mock-1',
        type: 'user',
        message: 'New agency user registered',
        user: 'Global Edu Corp',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'new'
      },
      {
        id: 'mock-2',
        type: 'payment',
        message: 'Payment processed successfully',
        user: 'System',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        status: 'completed'
      }
    ]
    
    // Combine and sort by timestamp
    const allActivities = [...activities, ...mockActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
    
    return NextResponse.json(allActivities)
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}