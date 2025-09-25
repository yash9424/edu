import { db } from "./database"
import bcrypt from 'bcryptjs'

export async function login(email: string, password: string): Promise<any | null> {
  try {
    console.log('Auth: Looking up user with email:', email)
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      console.log('Auth: User not found for email:', email)
      return null
    }
    
    console.log('Auth: Found user:', user.email, 'Role:', user.role)
    
    // Check if user is inactive
    if (user.status === "inactive") {
      throw new Error("Your account has been deactivated. Please contact administrator.")
    }
    
    // For agency users, check if their agency is active
    if (user.role === "Agency" && user.agencyId) {
      try {
        const agency = await db.getAgencyById(user.agencyId.toString())
        if (agency && agency.status === "inactive") {
          throw new Error("Your agency account is inactive. Please contact administrator.")
        }
      } catch (agencyError) {
        console.log('Auth: Could not check agency status:', agencyError.message)
        // Continue with login if agency check fails
      }
    }
    
    // Verify password
    console.log('Auth: Verifying password for user:', email)
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('Auth: Invalid password for user:', email)
      return null
    }
    
    console.log('Auth: Password verified for user:', email)
    
    // Update lastLogin timestamp (don't fail login if this fails)
    try {
      await db.updateUser(user._id.toString(), { lastLogin: new Date() })
    } catch (updateError) {
      console.log('Auth: Could not update lastLogin:', updateError.message)
    }
    
    // Return user without password
    const userObj = user.toObject ? user.toObject() : user
    const { password: _, ...userWithoutPassword } = userObj
    return {
      id: userWithoutPassword._id.toString(),
      email: userWithoutPassword.email,
      name: userWithoutPassword.name || userWithoutPassword.username,
      role: userWithoutPassword.role.toLowerCase() === 'admin' ? 'admin' : 'agency',
      agencyId: userWithoutPassword.agencyId?.toString(),
      agencyName: userWithoutPassword.agencyName
    }
  } catch (error) {
    console.error('Auth login error:', error)
    throw error
  }
}