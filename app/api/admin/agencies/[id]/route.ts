import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Agency from "@/lib/models/Agency"
import User from "@/lib/models/User"
import { broadcastEvent } from "@/app/api/events/route"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const agency = await Agency.findById(id)
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    return NextResponse.json({ agency })
  } catch (error) {
    console.error('Error fetching agency:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const data = await request.json()
    const updatedAgency = await Agency.findByIdAndUpdate(id, data, { new: true })

    if (!updatedAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    broadcastEvent({
      type: "agency",
      action: "update",
      data: updatedAgency,
    })

    return NextResponse.json({ agency: updatedAgency })
  } catch (error) {
    console.error('Error updating agency:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const agency = await Agency.findById(id)
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    if (agency.userId) {
      await User.findByIdAndDelete(agency.userId)
    }
    
    const deletedAgency = await Agency.findByIdAndDelete(id)

    broadcastEvent({
      type: "agency",
      action: "delete",
      data: deletedAgency,
    })

    return NextResponse.json({ message: "Agency and associated user deleted successfully" })
  } catch (error) {
    console.error('Error deleting agency:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}