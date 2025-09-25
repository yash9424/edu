import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const testApplication = await Application.create({
      studentName: "Test Student",
      email: "test@example.com",
      phone: "1234567890",
      agencyId: "507f1f77bcf86cd799439011",
      agencyName: "Test Agency",
      collegeId: "507f1f77bcf86cd799439012",
      collegeName: "Test College",
      courseId: "507f1f77bcf86cd799439013",
      courseName: "Test Course",
      courseType: "Undergraduate",
      stream: "Computer Science",
      status: "pending",
      fees: 25000,
      applicationId: `TEST-${Date.now()}`,
      studentDetails: {
        dateOfBirth: "1990-01-01",
        nationality: "Indian",
        address: "Test Address"
      },
      academicRecords: []
    })

    return NextResponse.json({ 
      success: true, 
      message: "Test application created successfully",
      id: testApplication._id 
    })
  } catch (error) {
    console.error('Test application creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    
    const applications = await Application.find({}).sort({ createdAt: -1 }).limit(10)
    
    return NextResponse.json({ 
      success: true, 
      count: applications.length,
      applications: applications.map(app => ({
        id: app._id.toString(),
        studentName: app.studentName,
        agencyName: app.agencyName,
        collegeName: app.collegeName,
        courseName: app.courseName,
        status: app.status,
        createdAt: app.createdAt
      }))
    })
  } catch (error) {
    console.error('Test application fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}