import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import { broadcastEvent } from "@/app/api/events/route"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const updatedUser = dataStore.resetUserPassword(id, password)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Broadcast real-time event
    broadcastEvent({
      type: "user",
      action: "update",
      data: { id, action: "password_reset", timestamp: new Date().toISOString() },
    })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}