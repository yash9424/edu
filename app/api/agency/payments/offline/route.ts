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
    
    const agency = await Agency.findOne({ userId: session.id })
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }
    
    const payments = await OfflinePayment.find({ agencyId: agency._id.toString() }).sort({ createdAt: -1 })
    return NextResponse.json(payments)
  } catch (error: any) {
    console.error("Error fetching offline payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    
    const formData = await request.formData()
    const file = formData.get('receiptFile') as File
    
    let receiptFileData = ''
    let receiptFileName = ''
    let receiptFileType = ''
    
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      receiptFileData = buffer.toString('base64')
      receiptFileName = file.name
      receiptFileType = file.type
    }
    
    const paymentData = {
      agencyId: agency._id.toString(),
      beneficiary: formData.get('beneficiary') as string,
      paymentType: formData.get('paymentType') as string,
      accountHolderName: formData.get('accountHolderName') as string,
      transactionId: formData.get('transactionId') as string,
      amount: parseFloat(formData.get('amount') as string),
      txnDate: new Date(formData.get('txnDate') as string),
      receiptFile: receiptFileName ? `data:${receiptFileType};base64,${receiptFileData}` : '',
      receiptFileData,
      receiptFileName,
      receiptFileType,
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