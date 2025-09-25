import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Agency from "@/lib/models/Agency"
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const users = await User.find().sort({ createdAt: -1 })
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString()
    }))
    
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
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
    
    const data = await request.json()
    
    let agencyId = null
    
    // If role is agency, create agency first
    if (data.role.toLowerCase() === 'agency') {
      try {
        const agency = await Agency.create({
          name: data.agencyName || data.username,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          contactPerson: data.username,
          commissionRate: data.commissionRate || 15,
          status: data.status || 'active'
        })
        agencyId = agency._id
      } catch (error) {
        console.error('Agency creation error:', error)
        return NextResponse.json({ error: "Failed to create agency" }, { status: 500 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const newUser = await User.create({
      username: data.username,
      name: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      status: data.status || 'active',
      agencyId,
      agencyName: data.agencyName
    })

    // Update agency with userId if agency was created
    if (agencyId) {
      try {
        await Agency.findByIdAndUpdate(agencyId, { userId: newUser._id })
      } catch (error) {
        console.error('Error linking agency to user:', error)
      }
    }

    return NextResponse.json({ user: { ...newUser.toObject(), id: newUser._id.toString() } }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}