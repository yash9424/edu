import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Settings from "@/lib/models/Settings"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      return NextResponse.json({ bankingDetails: {} })
    }
    
    return NextResponse.json({ bankingDetails: settings.bankingDetails || {} })
  } catch (error) {
    console.error('Error fetching banking details:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}