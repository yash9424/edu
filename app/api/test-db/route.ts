import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()
    const users = await User.find({}, 'email role status')
    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}