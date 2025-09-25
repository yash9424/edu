import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import College from '@/lib/models/College'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const colleges = await College.find({ status: 'active' })
      .select('name location type ranking establishedYear status')
      .sort({ ranking: 1, name: 1 })
    
    const formattedColleges = colleges.map(college => ({
      id: college._id.toString(),
      name: college.name,
      location: college.location,
      type: college.type,
      ranking: college.ranking,
      establishedYear: college.establishedYear,
      status: college.status
    }))
    
    return NextResponse.json(formattedColleges)
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}