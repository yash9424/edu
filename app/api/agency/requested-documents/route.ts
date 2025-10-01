import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const applications = await Application.find({
      pendingDocuments: { $exists: true, $not: { $size: 0 } }
    }).select('applicationId studentName collegeName courseName pendingDocuments status')

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching requested documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}