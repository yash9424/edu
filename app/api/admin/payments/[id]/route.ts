import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const payment = await Payment.findById(params.id)
      .populate('applicationId', 'applicationId')
    
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}