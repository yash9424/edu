import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'

export async function GET(request: NextRequest) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    
    // Get all payments from MongoDB
    const payments = await Payment.find({}).lean()
    
    // Calculate payment statistics
    const totalPayments = payments.length
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.applicationFee || payment.amount || 0), 0)
    
    // Count payments by status
    const pendingPayments = payments.filter(p => (p.paymentStatus || p.status || '').toLowerCase() === 'pending').length
    const completedPayments = payments.filter(p => (p.paymentStatus || p.status || '').toLowerCase() === 'paid').length
    const failedPayments = payments.filter(p => (p.paymentStatus || p.status || '').toLowerCase() === 'failed').length
    
    // Calculate average payment amount
    const averagePayment = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0
    
    // Calculate total commissions from payment records
    const totalCommissions = payments.reduce((sum, payment) => sum + (payment.commissionAmount || 0), 0)
    
    // Calculate monthly growth (comparing current month to previous month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const currentYear = now.getFullYear()
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const currentMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    
    const previousMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt)
      return paymentDate.getMonth() === previousMonth && paymentDate.getFullYear() === previousYear
    })
    
    const currentMonthRevenue = currentMonthPayments.reduce((sum, payment) => sum + (payment.applicationFee || payment.amount || 0), 0)
    const previousMonthRevenue = previousMonthPayments.reduce((sum, payment) => sum + (payment.applicationFee || payment.amount || 0), 0)
    
    let monthlyGrowth = 0
    if (previousMonthRevenue > 0) {
      monthlyGrowth = parseFloat((((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1))
    } else if (currentMonthRevenue > 0) {
      monthlyGrowth = 100 // If previous month was 0 and current month has revenue, that's 100% growth
    }
    
    const paymentStats = {
      totalRevenue,
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      monthlyGrowth,
      averagePayment,
      totalCommissions,
    }
    
    return NextResponse.json(paymentStats)
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json({ error: 'Failed to fetch payment stats' }, { status: 500 })
  }
}