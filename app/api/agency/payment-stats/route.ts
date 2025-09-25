import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Payment from "@/lib/models/Payment"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    await connectDB()
    
    // Get all payments (for debugging - remove agency filter)
    const payments = await Payment.find({})
    const applications = await Application.find({})
    
    // Calculate stats
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.applicationFee || 0), 0)
    const approvedPayments = payments.filter(p => p.paymentStatus === 'approved').length
    
    // Calculate monthly payments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyPayments = payments
      .filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
      .reduce((sum, payment) => sum + (payment.applicationFee || 0), 0)
    
    // Calculate growth (simplified)
    const monthlyGrowth = totalPayments > 0 ? 
      Math.round((monthlyPayments / totalPayments) * 100) : 0
    
    return NextResponse.json({
      totalPayments,
      monthlyPayments,
      monthlyGrowth,
      totalApplications: applications.length,
      approvedPayments
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json({
      totalPayments: 0,
      monthlyPayments: 0,
      monthlyGrowth: 0,
      totalApplications: 0,
      approvedPayments: 0
    })
  }
}