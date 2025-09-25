import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Settings from "@/lib/models/Settings"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ 
        adminEmail: 'admin@education.com',
        paymentSettings: {
          universalPaymentLink: 'https://payments.example.com/pay',
          enabled: true
        }
      })
      await settings.save()
    }
    
    return NextResponse.json({ 
      paymentSettings: settings.paymentSettings || {
        universalPaymentLink: 'https://payments.example.com/pay',
        enabled: true
      }
    })
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}