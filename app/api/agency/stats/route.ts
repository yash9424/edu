import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    await connectDB()
    
    // Show all applications for now to debug
    const applications = await Application.find({})
    
    const totalApplications = applications.length
    const successfulApplications = applications.filter(app => app.status === 'approved').length
    const pendingApplications = applications.filter(app => app.status === 'pending').length
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length
    
    // Calculate monthly growth based on applications from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentApplications = applications.filter(app => 
      new Date(app.createdAt) >= thirtyDaysAgo
    ).length
    
    const monthlyGrowth = totalApplications > 0 ? 
      Math.round((recentApplications / totalApplications) * 100) : 0
    
    return NextResponse.json({
      totalApplications,
      successfulApplications,
      pendingApplications,
      rejectedApplications,
      monthlyGrowth
    })
  } catch (error) {
    console.error('Error fetching agency stats:', error)
    return NextResponse.json({
      totalApplications: 0,
      successfulApplications: 0,
      pendingApplications: 0,
      rejectedApplications: 0,
      monthlyGrowth: 0
    })
  }
}