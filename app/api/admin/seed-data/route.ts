import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import College from '@/lib/models/College'
import Course from '@/lib/models/Course'

export async function POST() {
  try {
    await connectDB()
    
    // Create sample colleges
    const colleges = [
      {
        name: 'Stanford University',
        location: 'California, USA',
        type: 'University',
        ranking: 1,
        description: 'Leading research university',
        email: 'admissions@stanford.edu',
        phone: '+1-650-723-2300',
        facilities: ['Library', 'Labs', 'Sports'],
        establishedYear: 1885,
        status: 'active'
      },
      {
        name: 'University of Oxford',
        location: 'Oxford, UK',
        type: 'University',
        ranking: 2,
        description: 'Historic university',
        email: 'admissions@ox.ac.uk',
        phone: '+44-1865-270000',
        facilities: ['Library', 'Museums', 'Colleges'],
        establishedYear: 1096,
        status: 'active'
      },
      {
        name: 'MIT',
        location: 'Massachusetts, USA',
        type: 'Institute',
        ranking: 3,
        description: 'Technology focused institute',
        email: 'admissions@mit.edu',
        phone: '+1-617-253-1000',
        facilities: ['Labs', 'Research Centers'],
        establishedYear: 1861,
        status: 'active'
      }
    ]
    
    const createdColleges = await College.insertMany(colleges)
    
    // Create sample courses
    const courses = [
      {
        name: 'Computer Science',
        level: 'Bachelor',
        duration: '4 years',
        fee: 25000,
        currency: 'USD',
        requirements: 'High school diploma',
        courseType: 'Undergraduate',
        streams: ['Software Engineering', 'Data Science', 'AI/ML'],
        sessions: ['Fall 2024', 'Spring 2025'],
        collegeId: createdColleges[0]._id
      },
      {
        name: 'Business Administration',
        level: 'Master',
        duration: '2 years',
        fee: 45000,
        currency: 'USD',
        requirements: 'Bachelor degree',
        courseType: 'Postgraduate',
        streams: ['Finance', 'Marketing', 'Operations'],
        sessions: ['Fall 2024', 'Spring 2025'],
        collegeId: createdColleges[0]._id
      },
      {
        name: 'Engineering',
        level: 'Bachelor',
        duration: '4 years',
        fee: 30000,
        currency: 'GBP',
        requirements: 'A-levels or equivalent',
        courseType: 'Undergraduate',
        streams: ['Mechanical', 'Electrical', 'Civil'],
        sessions: ['September 2024', 'January 2025'],
        collegeId: createdColleges[1]._id
      },
      {
        name: 'Medicine',
        level: 'Bachelor',
        duration: '6 years',
        fee: 50000,
        currency: 'GBP',
        requirements: 'A-levels in Science',
        courseType: 'Undergraduate',
        streams: ['General Medicine', 'Surgery'],
        sessions: ['September 2024'],
        collegeId: createdColleges[1]._id
      }
    ]
    
    await Course.insertMany(courses)
    
    return NextResponse.json({ 
      message: 'Sample data created successfully',
      colleges: createdColleges.length,
      courses: courses.length
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json({ error: 'Failed to create sample data' }, { status: 500 })
  }
}