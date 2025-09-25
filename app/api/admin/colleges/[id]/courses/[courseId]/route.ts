import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { dataStore } from '@/lib/data-store'

export async function GET(request: NextRequest, { params }: { params: { id: string, courseId: string } }) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: collegeId, courseId } = params
    
    // Get course from the data store
    const course = dataStore.getCourse(courseId)
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    // Verify the course belongs to the specified college
    if (course.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Course not found in this college' }, { status: 404 })
    }
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string, courseId: string } }) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: collegeId, courseId } = params
    const courseData = await request.json()
    
    // Get existing course to verify it belongs to the college
    const existingCourse = dataStore.getCourse(courseId)
    
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    // Verify the course belongs to the specified college
    if (existingCourse.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Course not found in this college' }, { status: 404 })
    }
    
    // Update the course
    const updatedCourse = dataStore.updateCourse(courseId, {
      ...courseData,
      collegeId // Ensure collegeId remains the same
    })
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string, courseId: string } }) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: collegeId, courseId } = params
    
    // Get existing course to verify it belongs to the college
    const existingCourse = dataStore.getCourse(courseId)
    
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    // Verify the course belongs to the specified college
    if (existingCourse.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Course not found in this college' }, { status: 404 })
    }
    
    // Delete the course
    const success = dataStore.deleteCourse(courseId)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}