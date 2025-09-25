import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock payment status data
    const paymentData = {
      paid: 15,
      pending: 8,
      failed: 2
    }
    
    return NextResponse.json(paymentData)
  } catch (error) {
    console.error('Payment chart data error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment chart data' }, { status: 500 })
  }
}