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
    
    if (!payment || !payment.paymentReceipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    return NextResponse.json({
      receipt: payment.paymentReceipt,
      studentName: payment.studentName,
      amount: payment.applicationFee
    })
  } catch (error: any) {
    console.error("Error fetching receipt:", error)
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 })
  }
}