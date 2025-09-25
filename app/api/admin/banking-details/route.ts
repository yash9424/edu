import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Settings from "@/lib/models/Settings"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
      await settings.save()
    }
    
    return NextResponse.json({ bankingDetails: settings.bankingDetails || {} })
  } catch (error) {
    console.error('Error fetching banking details:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
    }
    
    settings.bankingDetails = body
    await settings.save()
    
    return NextResponse.json({ 
      success: true,
      bankingDetails: settings.bankingDetails,
      message: "Banking details updated successfully"
    })
  } catch (error) {
    console.error('Error updating banking details:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}