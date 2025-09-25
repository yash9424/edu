import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Document from "@/lib/models/Document"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const agency = searchParams.get("agency")
    const search = searchParams.get("search")
    
    // Fetch fresh data from MongoDB
    await connectDB()
    const apps = await Application.find({}).sort({ createdAt: -1 })
    
    // Fetch documents for all applications
    const applications = await Promise.all(apps.map(async (app) => {
      const documents = await Document.find({ applicationId: app._id.toString() })
      
      return {
        ...app.toObject(),
        id: app._id.toString(),
        submittedAt: app.createdAt,
        documents: documents.map(doc => doc.name), // Add document names to the documents array
        documentCount: documents.length, // Add document count for easy display
        uploadedDocuments: documents.map(doc => ({
          id: doc._id.toString(),
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadedAt: doc.uploadedAt,
          status: doc.status
        }))
      }
    }))
    
    let filteredApplications = applications

    if (status && status !== "all") {
      filteredApplications = filteredApplications.filter((app) => app.status === status)
    }

    if (agency && agency !== "all") {
      filteredApplications = filteredApplications.filter((app) => app.agencyName === agency)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredApplications = filteredApplications.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchLower) ||
          app.email.toLowerCase().includes(searchLower) ||
          app.id.toLowerCase().includes(searchLower) ||
          app.collegeName.toLowerCase().includes(searchLower) ||
          app.courseName.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json({ applications: filteredApplications })
  } catch (error: unknown) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicationId, status } = await request.json()

    await connectDB()
    
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    )

    if (!updatedApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Application status updated successfully",
      application: updatedApplication,
    })
  } catch (error: unknown) {
    console.error('Error updating application status:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    await connectDB()
    
    const newApplication = await Application.create({
      studentName: data.studentName,
      email: data.email,
      phone: data.phone,
      agencyId: user.agencyId || user.id,
      agencyName: user.agencyName || user.name,
      collegeId: data.collegeId,
      collegeName: data.collegeName,
      courseId: data.courseId,
      courseName: data.courseName,
      courseType: data.courseType,
      stream: data.stream,
      status: "pending",
      fees: data.fees || 0,
      documents: data.documents || [],
      studentDetails: data.studentDetails,
      academicRecords: data.academicRecords,
      abcId: data.abcId,
      debId: data.debId
    })

    return NextResponse.json({ application: newApplication }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating application:', error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
