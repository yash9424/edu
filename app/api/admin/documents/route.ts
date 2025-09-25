import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const documents = await Document.find({})
      .sort({ createdAt: -1 })

    return NextResponse.json(documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      size: doc.size,
      applicationId: doc.applicationId,
      agencyId: doc.agencyId,
      status: doc.status,
      uploadedAt: doc.uploadedAt
    })))
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { documentId, status } = await request.json()

    await connectDB()
    
    const document = await Document.findByIdAndUpdate(
      documentId,
      { status },
      { new: true }
    )

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}