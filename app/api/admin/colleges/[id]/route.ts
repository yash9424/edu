import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    const { id } = params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const college = await db.getCollegeById(id)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Get additional statistics
    const courses = await db.getCoursesByCollegeId(id)
    const applications = await db.getApplications()
    const collegeApplications = applications.filter(app => app.collegeId?.toString() === id)

    const collegeWithStats = {
      id: college._id.toString(),
      name: college.name,
      location: college.location,
      type: college.type,
      description: college.description,
      establishedYear: college.establishedYear,
      ranking: college.ranking,
      status: college.status,
      email: college.email,
      phone: college.phone,
      courses: courses.map(course => ({
        id: course._id.toString(),
        name: course.name,
        level: course.level,
        duration: course.duration,
        fee: course.fee,
        currency: course.currency,
        requirements: course.requirements,
        sessions: course.sessions,
        courseType: course.courseType,
        streams: course.streams,
        status: course.status
      })),
      totalCourses: courses.length,
      totalApplications: collegeApplications.length,
    }

    return NextResponse.json(collegeWithStats)
  } catch (error) {
    console.error('Error fetching college:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    const { id } = params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Update college basic info
    const updatedCollege = await db.updateCollege(id, {
      name: data.name,
      location: data.location,
      type: data.type,
      description: data.description,
      establishedYear: data.establishedYear,
      ranking: data.ranking,
      status: data.status,
      email: data.email,
      phone: data.phone
    })

    if (!updatedCollege) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Handle courses if provided
    if (data.courses && Array.isArray(data.courses)) {
      // Get existing courses
      const existingCourses = await db.getCoursesByCollegeId(id)
      const existingCourseIds = existingCourses.map(c => c._id.toString())
      
      // Process submitted courses
      const submittedCourseIds = []
      
      for (const courseData of data.courses) {
        console.log('Processing course:', courseData.name, 'Sessions:', courseData.sessions)
        
        if (courseData.id && !courseData.id.startsWith('temp_')) {
          // Update existing course
          console.log('Updating course with sessions:', courseData.sessions)
          await db.updateCourse(courseData.id, courseData)
          submittedCourseIds.push(courseData.id)
        } else {
          // Create new course
          console.log('Creating new course with sessions:', courseData.sessions)
          const newCourse = await db.createCourse({
            ...courseData,
            collegeId: id
          })
          submittedCourseIds.push(newCourse._id.toString())
        }
      }
      
      // Delete courses that were removed
      const coursesToDelete = existingCourseIds.filter(id => !submittedCourseIds.includes(id))
      for (const courseId of coursesToDelete) {
        await db.deleteCourse(courseId)
      }
    }

    return NextResponse.json(updatedCollege)
  } catch (error) {
    console.error('Error updating college:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    const { id } = params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deletedCollege = await db.deleteCollege(id)

    if (!deletedCollege) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "College deleted successfully" })
  } catch (error) {
    console.error('Error deleting college:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
