import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"
import Agency from "@/lib/models/Agency"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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
    
    let receiptFilePath = ''
    
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
      await mkdir(uploadsDir, { recursive: true })
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const filepath = join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      receiptFilePath = `/uploads/receipts/${filename}`
    }
    
    const paymentData = {
      agencyId: agency._id.toString(),
      beneficiary: formData.get('beneficiary') as string,
      paymentType: formData.get('paymentType') as string,
      accountHolderName: formData.get('accountHolderName') as string,
      transactionId: formData.get('transactionId') as string,
      amount: parseFloat(formData.get('amount') as string),
      txnDate: new Date(formData.get('txnDate') as string),
      receiptFile: receiptFilePath,
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