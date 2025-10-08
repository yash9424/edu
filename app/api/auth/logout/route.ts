import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await deleteSession()
    
    // Use environment variable for production domain or fallback to request origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    const redirectUrl = baseUrl ? `${baseUrl}/login` : new URL('/login', request.url).toString()
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await deleteSession()
    
    // Use environment variable for production domain or fallback to request origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    const redirectUrl = baseUrl ? `${baseUrl}/login` : new URL('/login', request.url).toString()
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
