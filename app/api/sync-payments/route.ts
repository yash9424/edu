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
    
    const applications = await Application.find({})
    let created = 0
    
    for (const app of applications) {
      try {
        const existingPayment = await Payment.findOne({ applicationId: app._id })
        
        if (!existingPayment) {
          await Payment.create({
            applicationId: app._id,
            studentName: app.studentName || 'Unknown',
            email: app.email || 'unknown@email.com',
            phone: app.phone || '0000000000',
            agencyId: app.agencyId,
            agencyName: app.agencyName || 'Unknown Agency',
            collegeId: app.collegeId || app._id,
            collegeName: app.collegeName || 'Unknown College',
            courseName: app.courseName || 'Unknown Course',
            applicationFee: app.fees || 0,
            tuitionFee: app.fees || 0,
            commissionRate: 10,
            commissionAmount: (app.fees || 0) * 0.1,
            paymentStatus: 'pending',
            leadStatus: 'applied',
            notes: `Application for ${app.courseName || 'Unknown Course'} at ${app.collegeName || 'Unknown College'}`
          })
          created++
        }
      } catch (paymentError) {
        console.error('Error creating payment for app:', app._id, paymentError)
        // Continue with next application
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Created ${created} payment records`,
      created
    })
  } catch (error) {
    console.error('Error syncing payments:', error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}