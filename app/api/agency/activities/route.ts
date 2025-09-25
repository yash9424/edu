import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Payment from '@/lib/models/Payment'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json([])
    }

    await connectDB()
    
    // Return empty activities for now to avoid errors
    const activities = [
      {
        id: 'sample_1',
        type: 'application',
        message: 'Welcome to the agency portal',
        user: session.name || 'User',
        timestamp: new Date(),
        status: 'active'
      }
    ]
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json([])
  }
}