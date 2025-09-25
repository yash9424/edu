import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Course from '@/lib/models/Course'

export async function GET(
  request: NextRequest,
  { params }: { params: { collegeId: string } }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const courses = await Course.find({ 
      collegeId: params.collegeId,
      status: 'active' 
    }).sort({ name: 1 })
    
    const formattedCourses = courses.map(course => {
      console.log('Course from DB:', {
        id: course._id.toString(),
        name: course.name,
        sessions: course.sessions
      })
      
      return {
        id: course._id.toString(),
        name: course.name,
        courseType: course.courseType,
        level: course.level,
        duration: course.duration,
        fees: course.fee,
        currency: course.currency,
        streams: course.streams || [],
        sessions: course.sessions && course.sessions.length > 0 ? course.sessions : []
      }
    })
    
    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}