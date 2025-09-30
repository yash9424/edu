import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Payment from "@/lib/models/Payment"

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string; type: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const payment = await Payment.findById(params.id)
    
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const document = payment.documents?.[params.type]
    
    if (!document || !document.fileData) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      fileData: document.fileData,
      name: document.filename || `${params.type}.pdf`,
      type: params.type
    })
  } catch (error: any) {
    console.error("Error fetching payment document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}