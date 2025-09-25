import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Document from "@/lib/models/Document"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    
    await connectDB()
    
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )
    
    if (!updatedApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    // Update document status based on application status
    if (body.status && updatedApplication.applicationId) {
      let documentStatus = 'pending'
      if (body.status === 'approved') {
        documentStatus = 'approved'
      } else if (body.status === 'rejected') {
        documentStatus = 'rejected'
      }
      
      await Document.updateMany(
        { applicationId: updatedApplication.applicationId },
        { status: documentStatus }
      )
    }
    
    return NextResponse.json({ 
      application: updatedApplication,
      message: "Application updated successfully"
    })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}