import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    
    const paymentData = {
      agencyId: session.id,
      beneficiary: body.beneficiary,
      paymentType: body.paymentType,
      accountHolderName: body.accountHolderName,
      transactionId: body.transactionId,
      amount: parseFloat(body.amount),
      txnDate: new Date(body.txnDate),
      status: "pending"
    }

    const offlinePayment = new OfflinePayment(paymentData)
    await offlinePayment.save()

    return NextResponse.json({ 
      success: true, 
      message: "Offline payment record saved successfully",
      id: offlinePayment._id 
    })
  } catch (error: any) {
    console.error("Error saving offline payment:", error)
    return NextResponse.json({ error: error.message || "Failed to save payment record" }, { status: 500 })
  }
}