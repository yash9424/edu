import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const payments = await OfflinePayment.find({}).sort({ createdAt: -1 })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error("Error fetching offline payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { paymentId, status } = await request.json()
    
    const payment = await OfflinePayment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    )

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, payment })
  } catch (error: any) {
    console.error("Error updating payment status:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}