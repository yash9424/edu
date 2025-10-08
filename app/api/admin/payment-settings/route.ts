import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Settings from "@/lib/models/Settings"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || (session.role !== "admin" && session.role !== "agency")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
      await settings.save()
    }
    
    const paymentSettings = settings.paymentSettings || {
      universalPaymentLink: 'https://payments.example.com/pay',
      enabled: true
    }
    
    return NextResponse.json({ 
      paymentSettings: {
        ...paymentSettings,
        isActive: paymentSettings.enabled
      }
    })
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json({ 
      paymentSettings: {
        universalPaymentLink: 'https://payments.example.com/pay',
        isActive: true
      }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({ adminEmail: session.email || 'admin@education.com' })
    }
    
    // Update payment settings
    settings.paymentSettings = {
      ...settings.paymentSettings,
      universalPaymentLink: body.universalPaymentLink,
      enabled: body.isActive,
      paymentGateway: body.paymentGateway || settings.paymentSettings?.paymentGateway || 'stripe',
      currency: body.currency || settings.paymentSettings?.currency || 'USD',
      publicKey: body.publicKey || settings.paymentSettings?.publicKey,
      secretKey: body.secretKey || settings.paymentSettings?.secretKey,
      webhookSecret: body.webhookSecret || settings.paymentSettings?.webhookSecret,
      paymentMethods: body.paymentMethods || settings.paymentSettings?.paymentMethods || [],
      minimumAmount: body.minimumAmount || settings.paymentSettings?.minimumAmount || 1,
      maximumAmount: body.maximumAmount || settings.paymentSettings?.maximumAmount || 10000,
      processingFee: body.processingFee || settings.paymentSettings?.processingFee || 0
    }
    
    await settings.save()
    
    return NextResponse.json({ 
      success: true,
      paymentSettings: settings.paymentSettings,
      message: "Payment settings updated successfully"
    })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json({ 
      error: "Failed to save settings"
    }, { status: 500 })
  }
}