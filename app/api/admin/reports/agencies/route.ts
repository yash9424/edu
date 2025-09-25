import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agencies = await db.getAgencies()
    
    const csvData = agencies.map(agency => ({
      ID: agency._id || agency.id,
      Name: agency.name,
      Email: agency.email,
      Phone: agency.phone,
      Address: agency.address,
      CommissionRate: agency.commissionRate,
      Status: agency.status,
      CreatedAt: new Date(agency.createdAt || Date.now()).toLocaleDateString('en-US')
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="agencies-report.csv"'
      }
    })
  } catch (error) {
    console.error('Agencies report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}