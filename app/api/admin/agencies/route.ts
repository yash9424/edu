import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Agency from "@/lib/models/Agency"
import User from "@/lib/models/User"
import Application from "@/lib/models/Application"
import Payment from "@/lib/models/Payment"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    await connectDB()
    
    const agencies = await Agency.find().sort({ createdAt: -1 })
    
    const agenciesWithStats = await Promise.all(agencies.map(async (agency) => {
      const applications = await Application.find({ agencyId: agency._id })
      const payments = await Payment.find({ agencyId: agency._id })
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      
      const user = await User.findById(agency.userId)
      
      return {
        id: agency._id.toString(),
        name: agency.name,
        email: agency.email,
        phone: agency.phone,
        address: agency.address,
        contactPerson: agency.contactPerson,
        commissionRate: agency.commissionRate,
        status: agency.status,
        createdAt: agency.createdAt,
        joinedDate: agency.createdAt,
        userId: agency.userId?.toString(),
        username: user?.name || 'N/A',
        totalApplications: applications.length,
        totalRevenue,
        hasUser: !!user
      }
    }))
    
    return NextResponse.json(agenciesWithStats)
  } catch (error) {
    console.error('Error fetching agencies:', error)
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
    const newAgency = await Agency.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      contactPerson: data.contactPerson,
      commissionRate: data.commissionRate || 10,
      status: "active",
    })

    return NextResponse.json({ agency: newAgency }, { status: 201 })
  } catch (error) {
    console.error('Error creating agency:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}