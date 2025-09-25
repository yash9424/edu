import { NextRequest, NextResponse } from "next/server"
import { getSession, createSession } from "@/lib/auth"
import * as bcrypt from "bcryptjs"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user data
    const user = dataStore.getUserById(session.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has an associated agency
    if (!user.agencyId) {
      return NextResponse.json({ error: "No agency associated with user" }, { status: 400 })
    }

    // Find the agency data
    const agency = await dataStore.getAgency(user.agencyId)
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    return NextResponse.json({ user, agency })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      description,
      contactPerson,
      website,
      currentPassword,
      newPassword,
      confirmPassword
    } = body

    // Find user in mock database using the shared mock data store
    const user = dataStore.getUserById(session.id)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const allUsers = dataStore.getUsers()
    const existingUser = allUsers.find(u => u.email === email && u.id !== session.id)
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      )
    }

    // Handle password change if requested
     let hashedNewPassword = user.password
     
     // Validate current password if provided
     if (currentPassword && newPassword) {
       if (!user.password) {
         return NextResponse.json(
           { error: "Current password not found" },
           { status: 400 }
         )
       }

       const isCurrentPasswordValid = await bcrypt.compare(
         currentPassword,
         user.password
       )
       if (!isCurrentPasswordValid) {
         return NextResponse.json(
           { error: "Current password is incorrect" },
           { status: 400 }
         )
       }

       // Hash new password
       hashedNewPassword = await bcrypt.hash(newPassword, 10)
     }

    // Update user data using the data store
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase()
    }
    
    if (hashedNewPassword) {
      updateData.password = hashedNewPassword
    }
    
    const updatedUser = dataStore.updateUser(session.id, updateData)

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Return updated user data without password
    const { password, ...updatedUserData } = updatedUser
    
    // If password was changed, force logout by not updating session
    if (hashedNewPassword && hashedNewPassword !== user.password) {
      return NextResponse.json({
        message: "Settings updated successfully. Please log in again with your new password.",
        user: updatedUserData,
        forceLogout: true
      })
    }
    
    // Update the session with new user data (only if password wasn't changed)
    await createSession({
      id: updatedUserData.id,
      name: updatedUserData.name || "",
      email: updatedUserData.email,
      role: updatedUserData.role.toLowerCase() as "admin" | "agency",
      agencyId: updatedUserData.agencyId
    })
    
    return NextResponse.json({
      message: "Settings updated successfully",
      user: updatedUserData
    })
    
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}