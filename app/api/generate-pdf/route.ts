import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Document from "@/lib/models/Document"
import { generateAdmissionFormPDF, AdmissionFormData, StudentDetails } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || (session.role !== "admin" && session.role !== "agency")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }

    await connectDB()
    
    console.log('Looking for application with ID:', applicationId)
    const application = await Application.findById(applicationId)
    if (!application) {
      console.log('Application not found for ID:', applicationId)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }
    console.log('Found application:', application.studentName)

    // Check authorization - agencies can only access their own applications
    if (session.role === "agency" && application.agencyId !== session.agencyId) {
      return NextResponse.json(
        { error: "Unauthorized to access this application" },
        { status: 403 }
      )
    }

    // Get uploaded documents for this application
    const documents = await Document.find({ applicationId: application.applicationId })

    // Prepare PDF data with documents and academic records
    const studentDetails = application.studentDetails || {};
    const pdfData: AdmissionFormData = {
      application: {
        ...application.toObject(),
        id: application._id.toString(),
        documents: documents.map(doc => `${doc.name} (${doc.type})`),
        uploadedDocuments: documents
      },
      studentDetails: {
        studentName: application.studentName,
        email: application.email,
        phone: application.phone,
        dateOfBirth: studentDetails.dateOfBirth,
        nationality: studentDetails.nationality,
        address: studentDetails.address,
        previousEducation: studentDetails.previousEducation,
        gpa: studentDetails.gpa,
        englishProficiency: studentDetails.englishProficiency,
        personalStatement: studentDetails.personalStatement,
        workExperience: studentDetails.workExperience
      },
      academicRecords: application.academicRecords || [],
      agencyName: application.agencyName,
      collegeName: application.collegeName,
      courseName: application.courseName,
      submissionDate: application.createdAt
    }

    // Generate PDF
    const pdfDataUri = generateAdmissionFormPDF(pdfData)
    
    if (!pdfDataUri) {
      return NextResponse.json(
        { error: "Failed to generate PDF data" },
        { status: 500 }
      )
    }
    
    // Update application to mark PDF as generated
    await Application.findByIdAndUpdate(applicationId, {
      pdfGenerated: true,
      lastUpdated: new Date()
    })

    // Convert base64 to buffer and return as PDF
    const base64Data = pdfDataUri.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="admission-form-${applicationId}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || (session.role !== "admin" && session.role !== "agency")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }

    await connectDB()
    
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.role === "agency" && application.agencyId !== session.agencyId) {
      return NextResponse.json(
        { error: "Unauthorized to access this application" },
        { status: 403 }
      )
    }

    // Get uploaded documents for this application
    const documents = await Document.find({ applicationId: application.applicationId })

    // Prepare PDF data with documents and academic records
    const studentDetails = application.studentDetails || {};
    const pdfData: AdmissionFormData = {
      application: {
        ...application.toObject(),
        id: application._id.toString(),
        documents: documents.map(doc => `${doc.name} (${doc.type})`),
        uploadedDocuments: documents
      },
      studentDetails: {
        studentName: application.studentName,
        email: application.email,
        phone: application.phone,
        dateOfBirth: studentDetails.dateOfBirth,
        nationality: studentDetails.nationality,
        address: studentDetails.address,
        previousEducation: studentDetails.previousEducation,
        gpa: studentDetails.gpa,
        englishProficiency: studentDetails.englishProficiency,
        personalStatement: studentDetails.personalStatement,
        workExperience: studentDetails.workExperience
      },
      academicRecords: application.academicRecords || [],
      agencyName: application.agencyName,
      collegeName: application.collegeName,
      courseName: application.courseName,
      submissionDate: application.createdAt
    }

    // Generate PDF
    const pdfDataUri = generateAdmissionFormPDF(pdfData)
    
    return NextResponse.json({
      success: true,
      pdfData: pdfDataUri,
      filename: `admission-form-${applicationId}.pdf`
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}