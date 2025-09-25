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
    
    return NextResponse.json({ escalationMatrix: settings.escalationMatrix || [] })
  } catch (error) {
    console.error('Error fetching escalation matrix:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { name, position, email, mobile, level } = body
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
    }
    
    const newEntry = {
      id: Date.now().toString(),
      name,
      position,
      email,
      mobile,
      level: level || 1
    }
    
    settings.escalationMatrix.push(newEntry)
    await settings.save()
    
    return NextResponse.json({ success: true, entry: newEntry })
  } catch (error) {
    console.error('Error creating escalation entry:', error)
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
    const { escalationMatrix } = body
    
    if (!Array.isArray(escalationMatrix)) {
      return NextResponse.json({ error: "Invalid escalation matrix data" }, { status: 400 })
    }
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
    }
    
    settings.escalationMatrix = escalationMatrix
    await settings.save()
    
    return NextResponse.json({ 
      success: true, 
      escalationMatrix: settings.escalationMatrix 
    })
  } catch (error) {
    console.error('Error updating escalation matrix:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const index = searchParams.get('index')
    
    if (index === null) {
      return NextResponse.json({ error: "Index required" }, { status: 400 })
    }
    
    let settings = await Settings.findOne({})
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }
    
    settings.escalationMatrix.splice(parseInt(index), 1)
    await settings.save()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting escalation entry:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}