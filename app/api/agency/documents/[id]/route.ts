import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectDB()
    
    const updatedDocument = await Document.findByIdAndUpdate(
      params.id,
      {
        type: data.type,
        applicationId: data.applicationId
      },
      { new: true }
    )
    
    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, document: updatedDocument })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const deletedDocument = await Document.findByIdAndDelete(params.id)
    
    if (!deletedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}