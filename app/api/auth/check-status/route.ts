import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()
    
    if (!userId && !email) {
      return NextResponse.json({ error: 'User ID or email required' }, { status: 400 })
    }
    
    const users = dataStore.getUsers()
    const user = users.find(u => u.id === userId || u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check user status
    if (user.status === 'inactive') {
      return NextResponse.json({ 
        active: false, 
        reason: 'user_deactivated',
        message: 'Your account has been deactivated. Please contact your administrator for assistance.'
      })
    }
    
    // For agency users, also check if their agency is inactive
    if (user.role === 'Agency' && user.agencyId) {
      const agency = await dataStore.getAgency(user.agencyId)
      if (agency && agency.status === 'inactive') {
        return NextResponse.json({ 
          active: false, 
          reason: 'agency_deactivated',
          message: 'Your agency has been deactivated. Please contact your administrator for assistance.'
        })
      }
    }
    
    return NextResponse.json({ active: true })
  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}