import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Agency from '@/lib/models/Agency'
import College from '@/lib/models/College'
import Application from '@/lib/models/Application'
import Payment from '@/lib/models/Payment'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    
    // Get all counts in parallel
    const [
      totalUsers,
      activeUsers,
      agencyUsers,
      totalAgencies,
      totalColleges,
      totalApplications,
      pendingApplications,
      totalPayments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'Agency' }),
      Agency.countDocuments(),
      College.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Payment.countDocuments()
    ])
    
    // Calculate monthly growth (simplified)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })
    
    const monthlyGrowth = totalApplications > 0 ? 
      Math.round((recentApplications / totalApplications) * 100) : 0
    
    return NextResponse.json({
      totalUsers,
      activeUsers,
      agencyUsers,
      totalAgencies,
      totalColleges,
      totalApplications,
      pendingApplications,
      totalPayments,
      monthlyGrowth
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({
      totalUsers: 0,
      activeUsers: 0,
      agencyUsers: 0,
      totalAgencies: 0,
      totalColleges: 0,
      totalApplications: 0,
      pendingApplications: 0,
      totalPayments: 0,
      monthlyGrowth: 0
    })
  }
}