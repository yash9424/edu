import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock payment data for CSV export
    const payments = [
      {
        ID: "PAY001",
        StudentName: "John Doe",
        AgencyName: "Global Edu Corp",
        Amount: 5000,
        Commission: 750,
        Status: "completed",
        Date: "1/15/2024"
      },
      {
        ID: "PAY002", 
        StudentName: "Jane Smith",
        AgencyName: "Dream Uni Consultants",
        Amount: 7500,
        Commission: 1125,
        Status: "pending",
        Date: "1/14/2024"
      }
    ]

    const csv = [
      Object.keys(payments[0]).join(','),
      ...payments.map(row => Object.values(row).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payments-report.csv"'
      }
    })
  } catch (error) {
    console.error('Payments report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}