import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"
import Application from "@/lib/models/Application"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const paymentStatus = searchParams.get('paymentStatus')
    const agencyId = searchParams.get('agencyId')
    const search = searchParams.get('search')
    
    let query: any = {}
    
    // Apply filters
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus
    }
    
    if (agencyId && agencyId !== 'all') {
      query.agencyId = agencyId
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { studentName: searchRegex },
        { email: searchRegex },
        { agencyName: searchRegex }
      ]
    }
    
    const payments = await Payment.find(query)
      .populate('applicationId', 'applicationId')
      .sort({ createdAt: -1 })
      .lean()
    
    // Calculate statistics
    const stats = {
      total: payments.length,
      pending: payments.filter(p => p.paymentStatus === 'pending').length,
      paid: payments.filter(p => p.paymentStatus === 'paid').length,
      verified: payments.filter(p => p.paymentStatus === 'verified').length,
      approved: payments.filter(p => p.paymentStatus === 'approved').length,
      rejected: payments.filter(p => p.paymentStatus === 'rejected').length,
      totalCommission: payments.reduce((sum, p) => sum + (p.commissionAmount || 0), 0)
    }
    
    console.log('Returning payments with receipts:', payments.filter(p => p.paymentReceipt).length)
    
    return NextResponse.json({
      payments,
      stats
    })
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { paymentId, paymentStatus, adminNotes, requestDocuments, paymentAmount, leadStatus, notes } = body
    
    // Find and update the payment record
    const payment = await Payment.findById(paymentId)
    
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }
    
    // Update payment fields
    if (paymentStatus) payment.paymentStatus = paymentStatus
    if (adminNotes) payment.adminNotes = adminNotes
    if (paymentAmount !== undefined) payment.applicationFee = paymentAmount
    if (leadStatus) payment.leadStatus = leadStatus
    if (notes) payment.notes = notes
    
    if (paymentStatus === 'verified' || paymentStatus === 'approved') {
      payment.verifiedAt = new Date()
      payment.verifiedBy = session.id
    }
    
    // Handle document requests
    if (requestDocuments && Array.isArray(requestDocuments)) {
      requestDocuments.forEach(docType => {
        if (payment.documents[docType]) {
          payment.documents[docType].adminRequested = true
        }
      })
    }
    
    await payment.save()
    
    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { applicationId } = body
    
    // Get application details
    const application = await Application.findById(applicationId)
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    // Check if payment record already exists
    const existingPayment = await Payment.findOne({ applicationId })
    
    if (existingPayment) {
      return NextResponse.json({ error: "Payment record already exists" }, { status: 400 })
    }
    
    // Create new payment record
    const payment = new Payment({
      applicationId: application._id,
      studentName: application.studentName,
      email: application.email,
      phone: application.phone,
      agencyId: application.agencyId,
      agencyName: application.agencyName,
      collegeId: application.collegeId,
      collegeName: application.collegeName,
      courseName: application.courseName,
      applicationFee: application.fees || 0,
      tuitionFee: application.fees || 0,
      commissionRate: 10, // Default 10%
      commissionAmount: (application.fees || 0) * 0.1,
      leadStatus: 'applied',
      notes: `Application for ${application.courseName} at ${application.collegeName}`
    })
    
    await payment.save()
    
    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error creating payment record:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
