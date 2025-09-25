import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await deleteSession()
    
    const url = new URL(request.url)
    const origin = url.origin
    
    return NextResponse.redirect(new URL('/login', origin))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await deleteSession()
    
    // Get the origin from the request to ensure we redirect to the correct port
    const url = new URL(request.url)
    const origin = url.origin
    
    return NextResponse.redirect(new URL('/login', origin))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
