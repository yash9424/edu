import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Payment from "@/lib/models/Payment"
import Document from "@/lib/models/Document"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const data = await request.json()
    console.log('Received application data:', data)
    
    // Get session to get real agency info
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log('Session data:', session)
    
    // Validate required fields
    if (!data.studentName || !data.email || !data.phone) {
      return NextResponse.json({ error: "Student name, email, and phone are required" }, { status: 400 })
    }
    
    if (!data.collegeId || !data.courseId) {
      return NextResponse.json({ error: "College and course selection are required" }, { status: 400 })
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(data.collegeId)) {
      return NextResponse.json({ error: "Invalid college selection" }, { status: 400 })
    }
    
    if (!mongoose.Types.ObjectId.isValid(data.courseId)) {
      return NextResponse.json({ error: "Invalid course selection" }, { status: 400 })
    }
    
    // Handle agency info - be flexible with session data
    let agencyId, agencyName
    
    // Try to get agencyId from session
    if (session.agencyId && mongoose.Types.ObjectId.isValid(session.agencyId)) {
      agencyId = session.agencyId
      agencyName = session.agencyName || session.name || 'Agency'
    } else if (session.id && mongoose.Types.ObjectId.isValid(session.id)) {
      // Use user ID as agencyId if no proper agencyId exists
      agencyId = session.id
      agencyName = session.name || session.email || 'User Agency'
    } else {
      // Create a default ObjectId as last resort
      agencyId = new mongoose.Types.ObjectId().toString()
      agencyName = session.name || session.email || 'Default Agency'
    }
    
    console.log('Using agencyId:', agencyId, 'agencyName:', agencyName)
    
    // Generate unique applicationId if not provided
    let applicationId = data.applicationId
    if (!applicationId) {
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
      applicationId = `APP-${timestamp}-${randomStr}`
      
      // Ensure uniqueness by checking if it already exists
      const existingApp = await Application.findOne({ applicationId })
      if (existingApp) {
        applicationId = `APP-${timestamp}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    }
    
    const applicationData = {
      studentName: data.studentName,
      email: data.email,
      phone: data.phone,
      agencyId: new mongoose.Types.ObjectId(agencyId),
      agencyName: agencyName,
      collegeId: new mongoose.Types.ObjectId(data.collegeId),
      collegeName: data.collegeName || 'Unknown College',
      courseId: new mongoose.Types.ObjectId(data.courseId),
      courseName: data.courseName || 'Unknown Course',
      courseType: data.courseType || '',
      stream: data.stream || '',
      status: 'pending',
      fees: Number(data.fees) || 0,
      applicationId: applicationId,
      abcId: data.abcId || '',
      debId: data.debId || '',
      studentDetails: {
        dateOfBirth: data.dateOfBirth || '',
        nationality: data.nationality || '',
        address: data.address || '',
        personalStatement: data.personalStatement || '',
        workExperience: data.workExperience || '',
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        religion: data.religion || '',
        caste: data.caste || '',
        maritalStatus: data.maritalStatus || ''
      },
      academicRecords: data.academicRecords || []
    }
    
    console.log('Creating application with data:', applicationData)
    
    const newApplication = await Application.create(applicationData)

    // Create payment record automatically
    try {
      const paymentData = {
        applicationId: newApplication._id,
        studentName: data.studentName,
        email: data.email,
        phone: data.phone,
        agencyId: new mongoose.Types.ObjectId(agencyId),
        agencyName: agencyName,
        collegeId: new mongoose.Types.ObjectId(data.collegeId),
        collegeName: data.collegeName || 'Unknown College',
        courseName: data.courseName || 'Unknown Course',
        applicationFee: Number(data.fees) || 0,
        tuitionFee: Number(data.fees) || 0,
        commissionRate: 10,
        commissionAmount: (Number(data.fees) || 0) * 0.1,
        paymentStatus: 'pending',
        leadStatus: 'applied',
        notes: `Application for ${data.courseName || 'Unknown Course'} at ${data.collegeName || 'Unknown College'}`,
        documents: {
          passport: { status: "missing", uploadedAt: null, adminRequested: false },
          transcript: { status: "missing", uploadedAt: null, adminRequested: false },
          sop: { status: "missing", uploadedAt: null, adminRequested: false },
          ielts: { status: "missing", uploadedAt: null, adminRequested: false }
        }
      }
      
      console.log('Creating payment with data:', paymentData)
      await Payment.create(paymentData)
    } catch (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Continue even if payment creation fails
    }

    return NextResponse.json({ 
      success: true, 
      id: newApplication._id,
      application: newApplication 
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ 
      error: "Failed to create application",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const data = await request.json()
    
    const updatedApplication = await Application.findByIdAndUpdate(
      data.id,
      {
        studentName: data.studentName,
        email: data.email,
        phone: data.phone,
        abcId: data.abcId,
        debId: data.debId,
        applicationId: data.applicationId,
        studentDetails: data.studentDetails,
        academicRecords: data.academicRecords
      },
      { new: true }
    )
    
    if (!updatedApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, application: updatedApplication })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log('GET Applications - Session:', session)
    
    await connectDB()
    
    // Show all applications for now to ensure they appear
    let query = {}
    
    console.log('Query:', query)
    
    const applications = await Application.find(query).sort({ createdAt: -1 })
    
    console.log('Found applications:', applications.length)
    
    return NextResponse.json(applications.map(app => ({
      id: app._id.toString(),
      _id: app._id.toString(),
      applicationId: app.applicationId,
      studentName: app.studentName,
      email: app.email,
      phone: app.phone,
      agencyId: app.agencyId?.toString(),
      agencyName: app.agencyName,
      collegeId: app.collegeId?.toString(),
      collegeName: app.collegeName,
      courseId: app.courseId?.toString(),
      courseName: app.courseName,
      courseType: app.courseType,
      stream: app.stream,
      status: app.status,
      fees: app.fees || 0,
      abcId: app.abcId,
      debId: app.debId,
      studentDetails: app.studentDetails,
      academicRecords: app.academicRecords,
      submittedAt: app.createdAt
    })))
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}