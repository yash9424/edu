import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}