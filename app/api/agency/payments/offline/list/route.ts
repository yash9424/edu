import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const payments = await OfflinePayment.find({
      agencyId: session.id
    }).sort({ createdAt: -1 })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error("Error fetching offline payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}