import { NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Delete the session
    await deleteSession()

    // Get the host from the request headers
    const host = request.headers.get('host') || 'localhost:3004'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    
    // Create redirect URL with correct host
    const redirectUrl = `${protocol}://${host}/login`
    
    console.log('Logout redirect to:', redirectUrl)

    // For form submissions, use 302 redirect
    return NextResponse.redirect(redirectUrl, 302)

  } catch (error: any) {
    console.error("Logout error:", error)
    const host = request.headers.get('host') || 'localhost:3004'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    return NextResponse.redirect(`${protocol}://${host}/login`, 302)
  }
}