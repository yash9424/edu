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
    
    // Group applications by month
    const monthlyData = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0
    })
    
    // Count applications by month
    applications.forEach(app => {
      const date = new Date(app.createdAt)
      const monthName = months[date.getMonth()]
      monthlyData[monthName]++
    })
    
    // Convert to chart format
    const applicationData = months.map(month => ({
      month,
      applications: monthlyData[month]
    }))
    
    return NextResponse.json({ applicationData })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}