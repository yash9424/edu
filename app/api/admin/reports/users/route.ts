import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await db.getUsers()
    
    const csvData = users.map(user => ({
      ID: user._id || user.id,
      Username: user.username,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Status: user.status,
      AgencyName: user.agencyName || 'N/A',
      LastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US') : 'Never',
      CreatedAt: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US')
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users-report.csv"'
      }
    })
  } catch (error) {
    console.error('Users report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}