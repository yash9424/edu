import { type NextRequest, NextResponse } from "next/server"
import { login, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log('Login attempt for:', email)
    
    const user = await login(email, password)

    if (!user) {
      console.log('Login failed: Invalid credentials for', email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log('Login successful for:', email, 'Role:', user.role)
    
    await createSession(user)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login API error:', error)
    // Handle specific authentication errors (inactive user/agency)
    if (error instanceof Error && (error.message.includes("inactive") || error.message.includes("deactivated"))) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 })
  }
}
