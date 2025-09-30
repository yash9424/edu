import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const formData = await request.formData()
    const paymentId = formData.get('paymentId') as string
    const receipt = formData.get('receipt') as File
    
    console.log('Receipt upload request:', { paymentId, filename: receipt?.name })
    
    if (!paymentId || !receipt) {
      return NextResponse.json({ error: "Payment ID and receipt file are required" }, { status: 400 })
    }

    // Find payment first
    const payment = await Payment.findById(paymentId)
    
    if (!payment) {
      console.log('Payment not found:', paymentId)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Convert file to base64 for storage
    const bytes = await receipt.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    
    const receiptData = {
      filename: receipt.name,
      size: receipt.size,
      mimeType: receipt.type,
      data: base64Data,
      uploadedAt: new Date(),
      uploadedBy: session.id
    }

    console.log('Updating payment with receipt data:', paymentId)
    
    // Update payment with receipt and status
    payment.paymentReceipt = receiptData
    payment.paymentStatus = 'pending_approval'
    payment.paymentDate = new Date()
    
    await payment.save()
    
    console.log('Payment updated with receipt:', payment._id, payment.paymentReceipt?.filename)

    return NextResponse.json({ 
      success: true, 
      message: "Receipt uploaded successfully",
      paymentId: payment._id,
      payment: {
        _id: payment._id,
        paymentStatus: payment.paymentStatus,
        paymentReceipt: {
          filename: payment.paymentReceipt.filename,
          uploadedAt: payment.paymentReceipt.uploadedAt
        }
      }
    })
  } catch (error: any) {
    console.error("Error uploading receipt:", error)
    return NextResponse.json({ error: "Failed to upload receipt: " + error.message }, { status: 500 })
  }
}