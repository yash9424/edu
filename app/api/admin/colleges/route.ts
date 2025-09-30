import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import College from "@/lib/models/College"
import Course from "@/lib/models/Course"
import Application from "@/lib/models/Application"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const colleges = await College.find().sort({ ranking: 1, name: 1 })
    
    const collegesWithStats = await Promise.all(colleges.map(async (college) => {
      const courses = await Course.find({ collegeId: college._id })
      const applications = await Application.find({ collegeId: college._id })
      
      return {
        ...college.toObject(),
        id: college._id.toString(),
        totalCourses: courses.length,
        totalApplications: applications.length
      }
    }))
    
    return NextResponse.json(collegesWithStats)
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const data = await request.json()
    const newCollege = await College.create({
      name: data.name,
      location: data.location,
      type: data.type,
      ranking: data.ranking || 0,
      description: data.description || "No description provided",
      email: data.email || "contact@college.edu",
      phone: data.phone || "000-000-0000",
      facilities: data.facilities || [],
      status: "active",
      establishedYear: data.establishedYear || new Date().getFullYear(),
    })
    
    // Add courses if provided
    if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
      for (const course of data.courses) {
        await Course.create({
          ...course,
          collegeId: newCollege._id
        })
      }
    }

    return NextResponse.json({ college: { ...newCollege.toObject(), id: newCollege._id.toString() } }, { status: 201 })
  } catch (error) {
    console.error('Error creating college:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
