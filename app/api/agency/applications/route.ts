import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"
import Payment from "@/lib/models/Payment"
import Document from "@/lib/models/Document"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const data = await request.json()
    
    const applicationId = data.applicationId || `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    const applicationData = {
      studentName: data.studentName,
      email: data.email,
      phone: data.phone,
      agencyId: session.id,
      agencyName: session.name || 'Agency',
      collegeId: data.collegeId,
      collegeName: data.collegeName,
      courseId: data.courseId,
      courseName: data.courseName,
      courseType: data.courseType,
      stream: data.stream,
      status: 'pending',
      fees: Number(data.fees) || 0,
      applicationId: applicationId,
      abcId: data.abcId,
      debId: data.debId,
      studentDetails: {
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
        address: data.address,
        personalStatement: data.personalStatement,
        workExperience: data.workExperience,
        fatherName: data.fatherName,
        motherName: data.motherName,
        religion: data.religion,
        caste: data.caste,
        maritalStatus: data.maritalStatus
      },
      academicRecords: data.academicRecords || []
    }
    
    const newApplication = await Application.create(applicationData)

    // Create payment record
    const paymentData = {
      applicationId: newApplication._id,
      studentName: data.studentName,
      email: data.email,
      phone: data.phone,
      agencyId: session.id,
      agencyName: session.name || 'Agency',
      collegeId: data.collegeId,
      collegeName: data.collegeName,
      courseName: data.courseName,
      applicationFee: Number(data.fees) || 0,
      tuitionFee: Number(data.fees) || 0,
      commissionRate: 10,
      commissionAmount: (Number(data.fees) || 0) * 0.1,
      paymentStatus: 'pending',
      leadStatus: 'applied',
      notes: `Application for ${data.courseName}`,
      documents: {
        passport: { status: "missing", uploadedAt: null, adminRequested: false },
        transcript: { status: "missing", uploadedAt: null, adminRequested: false },
        sop: { status: "missing", uploadedAt: null, adminRequested: false },
        ielts: { status: "missing", uploadedAt: null, adminRequested: false }
      }
    }
    
    await Payment.create(paymentData)

    return NextResponse.json({ 
      success: true, 
      id: newApplication._id,
      applicationId: applicationId,
      application: {
        _id: newApplication._id,
        applicationId: applicationId
      }
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to create application"
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