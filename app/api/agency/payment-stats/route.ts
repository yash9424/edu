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
    
    // Get payments and applications for current agency
    const payments = await Payment.find({ agencyId: session.userId })
    const applications = await Application.find({ agencyId: session.userId })
    
    console.log('Agency stats - Total payments found:', payments.length)
    console.log('Agency stats - Total applications found:', applications.length)
    
    // Calculate stats
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.applicationFee || 0), 0)
    const approvedPayments = payments.filter(p => p.paymentStatus === 'approved' || p.paymentStatus === 'verified').length
    
    // Calculate monthly payments (current month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthlyPayments = payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum, payment) => sum + (payment.applicationFee || 0), 0)
    
    // Calculate previous month for growth
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const prevMonthPayments = payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate.getMonth() === prevMonth && paymentDate.getFullYear() === prevYear
      })
      .reduce((sum, payment) => sum + (payment.applicationFee || 0), 0)
    
    const monthlyGrowth = prevMonthPayments > 0 ? 
      Math.round(((monthlyPayments - prevMonthPayments) / prevMonthPayments) * 100) : 
      (monthlyPayments > 0 ? 100 : 0)
    
    console.log('Stats calculated:', {
      totalPayments,
      monthlyPayments,
      monthlyGrowth,
      totalApplications: applications.length,
      approvedPayments
    })
    
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