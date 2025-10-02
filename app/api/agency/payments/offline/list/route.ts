import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"
import Agency from "@/lib/models/Agency"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Find the agency for this user
    let agency = await Agency.findOne({ userId: session.id })
    if (!agency) {
      // Create agency record if it doesn't exist
      agency = new Agency({
        name: session.email || 'Agency User',
        email: session.email,
        contactPerson: session.email || 'Agency Contact',
        userId: session.id,
        username: session.email
      })
      await agency.save()
    }
    
    const payments = await OfflinePayment.find({
      agencyId: agency._id.toString()
    }).sort({ createdAt: -1 })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error("Error fetching offline payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}