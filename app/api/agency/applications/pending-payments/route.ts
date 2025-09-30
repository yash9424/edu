import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/lib/models/Application"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const applications = await Application.find({
      agencyId: session.id,
      status: { $in: ["pending", "approved"] }
    }).select("applicationId studentName fees status")

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error("Error fetching pending payments:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}