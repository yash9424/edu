import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"
import Application from "@/lib/models/Application"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const agencyIdValue = typeof session.agencyId === 'string' ? session.agencyId : 
                         typeof session.id === 'string' ? session.id : 
                         JSON.stringify(session.agencyId || session.id)
    
    const documents = await Document.find({ agencyId: agencyIdValue })
      .sort({ createdAt: -1 })

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
    
    const agencyIdValue = typeof session.agencyId === 'string' ? session.agencyId : 
                         typeof session.id === 'string' ? session.id : 
                         JSON.stringify(session.agencyId || session.id)
    
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