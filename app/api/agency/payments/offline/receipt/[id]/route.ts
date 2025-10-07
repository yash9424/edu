import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { OfflinePayment } from "@/lib/models/OfflinePayment"
import Agency from "@/lib/models/Agency"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const payment = await OfflinePayment.findOne({ 
      _id: params.id, 
      agencyId: agency._id.toString() 
    })
    
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const getFileExtension = (mimeType: string) => {
      const extensions: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg', 
        'image/png': '.png',
        'application/pdf': '.pdf',
        'image/gif': '.gif',
        'image/bmp': '.bmp'
      }
      return extensions[mimeType] || ''
    }

    // Handle different file formats
    if (payment.receiptFileData) {
      const buffer = Buffer.from(payment.receiptFileData, 'base64')
      const ext = getFileExtension(payment.receiptFileType || '')
      const filename = payment.receiptFileName || `receipt-${payment._id}${ext}`
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': payment.receiptFileType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${filename}"`
        }
      })
    }
    
    if (payment.receiptFile) {
      if (payment.receiptFile.startsWith('/uploads/')) {
        return NextResponse.redirect(new URL(payment.receiptFile, request.url))
      } else if (payment.receiptFile.startsWith('data:')) {
        const [header, data] = payment.receiptFile.split(',')
        const mimeMatch = header.match(/data:([^;]+)/)
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
        const ext = getFileExtension(mimeType)
        const buffer = Buffer.from(data, 'base64')
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `inline; filename="receipt-${payment._id}${ext}"`
          }
        })
      }
    }
    
    return NextResponse.json({ error: "Receipt file not available" }, { status: 404 })

  } catch (error: any) {
    console.error("Error downloading receipt:", error)
    return NextResponse.json({ error: "Failed to download receipt" }, { status: 500 })
  }
}