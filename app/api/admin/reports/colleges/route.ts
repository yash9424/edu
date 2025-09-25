import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const colleges = await db.getColleges()
    
    const csvData = colleges.map(college => ({
      ID: college._id || college.id,
      Name: college.name,
      Location: college.location,
      Type: college.type,
      Ranking: college.ranking,
      EstablishedYear: college.establishedYear,
      Email: college.email,
      Phone: college.phone,
      Status: college.status
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="colleges-report.csv"'
      }
    })
  } catch (error) {
    console.error('Colleges report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}