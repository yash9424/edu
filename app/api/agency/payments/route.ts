import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"
import Application from "@/lib/models/Application"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Get all payments for debugging
    let payments = await Payment.find({})
      .populate('applicationId', 'applicationId')
      .sort({ createdAt: -1 })

    // If no payments found, create them from applications
    if (payments.length === 0) {
      const applications = await Application.find({})
      
      for (const app of applications) {
        const existingPayment = await Payment.findOne({ applicationId: app._id })
        
        if (!existingPayment) {
          await Payment.create({
            applicationId: app._id,
            studentName: app.studentName,
            email: app.email,
            phone: app.phone,
            agencyId: app.agencyId,
            agencyName: app.agencyName,
            collegeId: app.collegeId || app._id,
            collegeName: app.collegeName,
            courseName: app.courseName,
            applicationFee: app.fees || 0,
            tuitionFee: app.fees || 0,
            commissionRate: 10,
            commissionAmount: (app.fees || 0) * 0.1,
            paymentStatus: 'pending',
            leadStatus: 'applied',
            notes: `Application for ${app.courseName} at ${app.collegeName}`
          })
        }
      }
      
      // Fetch payments again after creation
      payments = await Payment.find({})
        .populate('applicationId', 'applicationId')
        .sort({ createdAt: -1 })
    }

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { paymentId, paymentStatus } = body
    
    console.log('Updating payment:', paymentId, paymentStatus)
    
    const payment = await Payment.findById(paymentId)
    
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }
    
    if (paymentStatus === 'paid') {
      payment.paymentStatus = 'pending_approval'
      payment.paymentDate = new Date()
    } else if (paymentStatus === 'failed') {
      payment.paymentStatus = 'failed'
    }
    
    await payment.save()
    
    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { paymentId, paymentAmount, leadStatus, notes } = body
    
    const payment = await Payment.findById(paymentId)
    
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }
    
    if (paymentAmount !== undefined) payment.applicationFee = paymentAmount
    if (leadStatus) payment.leadStatus = leadStatus
    if (notes !== undefined) payment.notes = notes
    
    await payment.save()
    
    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}