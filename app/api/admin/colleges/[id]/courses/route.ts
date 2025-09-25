import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { dataStore } from '@/lib/data-store'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collegeId = params.id
    
    // Get college courses from the data store
    const courses = dataStore.getCoursesByCollegeId(collegeId)
    
    if (!courses) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 })
    }
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching college courses:', error)
    return NextResponse.json({ error: 'Failed to fetch college courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  // Check if user is authenticated and has admin role
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collegeId = params.id
    const courseData = await request.json()
    
    // Create a new course for the college
    const newCourse = dataStore.createCourse({
      ...courseData,
      collegeId
    })
    
    return NextResponse.json(newCourse)
  } catch (error) {
    console.error('Error creating college course:', error)
    return NextResponse.json({ error: 'Failed to create college course' }, { status: 500 })
  }
}