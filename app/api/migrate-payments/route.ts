import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"
import Application from "@/lib/models/Application"

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Get all applications that don't have payment records
    const applications = await Application.find({})
    
    let created = 0
    let skipped = 0
    
    for (const app of applications) {
      // Check if payment record already exists
      const existingPayment = await Payment.findOne({ applicationId: app._id })
      
      if (existingPayment) {
        skipped++
        continue
      }
      
      // Create payment record from application
      const payment = new Payment({
        applicationId: app._id,
        studentName: app.studentName,
        email: app.email,
        phone: app.phone,
        agencyId: app.agencyId,
        agencyName: app.agencyName,
        collegeId: app.collegeId,
        collegeName: app.collegeName,
        courseName: app.courseName,
        applicationFee: app.fees || 0,
        tuitionFee: app.fees || 0,
        commissionRate: 10, // Default 10%
        commissionAmount: (app.fees || 0) * 0.1,
        paymentStatus: app.status === 'approved' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'pending',
        leadStatus: app.status === 'approved' ? 'enrolled' : app.status === 'pending' ? 'applied' : 'interested',
        notes: `Application for ${app.courseName} at ${app.collegeName}`,
        documents: {
          passport: { status: "uploaded", uploadedAt: app.createdAt, adminRequested: false },
          transcript: { status: "uploaded", uploadedAt: app.createdAt, adminRequested: false },
          sop: { status: "pending", uploadedAt: null, adminRequested: true },
          ielts: { status: "missing", uploadedAt: null, adminRequested: false }
        }
      })
      
      await payment.save()
      created++
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. Created ${created} payment records, skipped ${skipped} existing records.`,
      created,
      skipped
    })
  } catch (error) {
    console.error('Error migrating payments:', error)
    return NextResponse.json({ error: "Migration failed" }, { status: 500 })
  }
}