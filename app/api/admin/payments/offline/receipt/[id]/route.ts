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
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const payment = await OfflinePayment.findById(params.id)
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

    // Handle file download - check both new and old formats
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

    const agency = await Agency.findById(payment.agencyId)
    
    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-info { margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .status { padding: 5px 10px; border-radius: 5px; }
          .approved { background-color: #d4edda; color: #155724; }
          .pending { background-color: #fff3cd; color: #856404; }
          .rejected { background-color: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Receipt ID: ${payment._id}</p>
        </div>
        
        <div class="receipt-info">
          <div class="row">
            <span class="label">Agency Name:</span>
            <span>${agency?.name || 'Unknown Agency'}</span>
          </div>
          <div class="row">
            <span class="label">Beneficiary:</span>
            <span>${payment.beneficiary}</span>
          </div>
          <div class="row">
            <span class="label">Account Holder:</span>
            <span>${payment.accountHolderName}</span>
          </div>
          <div class="row">
            <span class="label">Payment Type:</span>
            <span>${payment.paymentType.toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Amount:</span>
            <span>₹${payment.amount}</span>
          </div>
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span>${payment.transactionId}</span>
          </div>
          <div class="row">
            <span class="label">Transaction Date:</span>
            <span>${new Date(payment.txnDate).toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="status ${payment.status}">${payment.status.toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Generated On:</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${payment._id}.html"`
      }
    })

  } catch (error: any) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }
}