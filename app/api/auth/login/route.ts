import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { db } from "@/lib/database"
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)

    // Get user from database
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if user is inactive
    if (user.status === "inactive") {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact administrator." },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('Invalid password for:', email)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create user object without password
    const userObj = user.toObject ? user.toObject() : user
    const { password: _, ...userWithoutPassword } = userObj
    const sessionUser = {
      id: userWithoutPassword._id.toString(),
      email: userWithoutPassword.email,
      name: userWithoutPassword.name || userWithoutPassword.username,
      role: userWithoutPassword.role.toLowerCase() === 'admin' ? 'admin' : 'agency',
      agencyId: userWithoutPassword.agencyId?.toString(),
      agencyName: userWithoutPassword.agencyName
    }

    // Create session
    await createSession(sessionUser)

    console.log('Login successful for:', email, 'Role:', sessionUser.role)

    return NextResponse.json({
      message: "Login successful",
      user: sessionUser
    })

  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    )
  }
}