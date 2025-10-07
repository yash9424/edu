import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"
import Application from "@/lib/models/Application"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const agencyIdValue = session.id
    
    // Check if filtering by applicationId is requested
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    let query: any = { agencyId: agencyIdValue }
    if (applicationId) {
      query.applicationId = applicationId
      console.log('Filtering documents by applicationId:', applicationId)
    }
    
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
    
    console.log('Found documents:', documents.length, 'for query:', query)

    return NextResponse.json(documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      size: doc.size,
      applicationId: doc.applicationId,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
      fileData: doc.fileData
    })))
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, size, applicationId, fileData } = await request.json()
    
    const agencyIdValue = session.id
    
    console.log('Upload data:', { name, type, size, applicationId, agencyId: agencyIdValue })

    await connectDB()
    
    const document = await Document.create({
      name: name || 'unknown',
      type: type || 'unknown',
      size: size || 0,
      applicationId: applicationId || 'default',
      agencyId: agencyIdValue,
      filePath: `/uploads/${name || 'unknown'}`,
      fileData: fileData || '',
      status: 'pending'
    })
    
    // Remove uploaded document type from pending documents
    const application = await Application.findOne({ applicationId: applicationId })
    if (application && application.pendingDocuments) {
      application.pendingDocuments = application.pendingDocuments.filter(doc => doc !== type)
      await application.save()
      console.log('Removed', type, 'from pending documents for application:', applicationId)
    }
    
    // Also update Payment model documents field
    const Payment = (await import('@/lib/models/Payment')).default
    const payment = await Payment.findOne({ 
      $or: [
        { 'applicationId.applicationId': applicationId },
        { applicationId: applicationId },
        { studentName: { $regex: new RegExp(applicationId, 'i') } }
      ]
    })
    
    if (payment) {
      if (!payment.documents) payment.documents = {}
      
      payment.documents[type] = {
        status: 'uploaded',
        uploadedAt: new Date(),
        adminRequested: false,
        documentId: document._id.toString()
      }
      
      await payment.save()
      console.log('Updated payment documents for:', applicationId, 'Payment ID:', payment._id)
    } else {
      console.log('No payment found for applicationId:', applicationId)
    }

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document._id.toString(),
        name: document.name,
        type: document.type,
        size: document.size,
        applicationId: document.applicationId,
        status: document.status,
        uploadedAt: document.uploadedAt
      }
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ 
      error: "Failed to upload document",
      details: error.message 
    }, { status: 500 })
  }
}