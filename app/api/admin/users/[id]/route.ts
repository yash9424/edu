import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

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

    const user = await db.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
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

    const data = await request.json()
    console.log('Updating user with data:', data)
    
    // Validate required fields
    if (!data.username || !data.email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 })
    }

    const updateData = {
      username: data.username,
      email: data.email,
      name: data.name || data.username,
      role: data.role,
      status: data.status
    }

    // Only add password if provided
    if (data.password && data.password.trim() !== '') {
      updateData.password = data.password
    }
    
    console.log('About to update user with:', updateData)
    const updatedUser = await db.updateUser(id, updateData)
    console.log('User update successful:', updatedUser?.id)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('Updated user:', updatedUser)

    // Handle agency operations based on role
    if (data.role === 'Agency') {
      if (updatedUser.agencyId && data.agencyName) {
        // Update existing agency
        console.log('Updating agency:', updatedUser.agencyId)
        try {
          const agencyUpdateData = {
            name: data.agencyName,
            email: data.email,
            contactPerson: data.username,
            status: data.status
          }

          // Only add optional fields if they exist
          if (data.phone) agencyUpdateData.phone = data.phone
          if (data.address) agencyUpdateData.address = data.address
          if (data.commissionRate !== undefined) agencyUpdateData.commissionRate = data.commissionRate

          await db.updateAgency(updatedUser.agencyId, agencyUpdateData)
        } catch (agencyError) {
          console.error('Error updating agency:', agencyError)
        }
      } else if (!updatedUser.agencyId && data.agencyName) {
        // Create new agency if user doesn't have one
        console.log('Creating new agency for user')
        try {
          const newAgency = await db.createAgency({
            name: data.agencyName,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            contactPerson: data.username,
            commissionRate: data.commissionRate || 15,
            status: data.status || 'active',
            userId: updatedUser._id
          })
          
          // Update user with agencyId
          await db.updateUser(id, { agencyId: newAgency._id })
        } catch (agencyError) {
          console.error('Error creating agency:', agencyError)
        }
      }
    } else if (updatedUser.agencyId) {
      // If role changed from Agency to something else, delete the agency
      try {
        await db.deleteAgency(updatedUser.agencyId)
        await db.updateUser(id, { agencyId: null })
      } catch (agencyError) {
        console.error('Error deleting agency when role changed:', agencyError)
      }
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    console.error('Error stack:', error.stack)
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: "Email already exists", 
        details: "This email is already registered to another user" 
      }, { status: 400 })
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deletedUser = await db.deleteUser(id)
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User and associated agency deleted successfully" })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}