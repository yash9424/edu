import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const document = await Document.findById(params.id)
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: document._id.toString(),
      name: document.name,
      type: document.type,
      size: document.size,
      applicationId: document.applicationId,
      fileData: document.fileData,
      status: document.status,
      uploadedAt: document.uploadedAt
    })
  } catch (error: any) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}