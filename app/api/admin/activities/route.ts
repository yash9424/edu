import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock activities for now to avoid build issues
    const mockActivities = [
      {
        id: 'mock-1',
        type: 'application',
        message: 'New application submitted',
        user: 'Student User',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        id: 'mock-2',
        type: 'user',
        message: 'New agency user registered',
        user: 'Global Edu Corp',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'new'
      },
      {
        id: 'mock-3',
        type: 'payment',
        message: 'Payment processed successfully',
        user: 'System',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'completed'
      }
    ]
    
    return NextResponse.json(mockActivities)
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}