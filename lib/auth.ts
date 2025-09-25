import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { db } from "./database"
import bcrypt from 'bcryptjs'

const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string | undefined): Promise<any> {
  if (!input) {
    return null
  }

  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    return null
  }
}

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

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const payload = await decrypt(session)
    return payload.user
  } catch (error) {
    return null
  }
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function verifyAuth(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("cookie")

  if (!cookieHeader) {
    return null
  }

  // Extract session cookie from cookie header
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [name, value] = cookie.trim().split("=")
      acc[name] = value
      return acc
    },
    {} as Record<string, string>,
  )

  const session = cookies.session

  if (!session) {
    return null
  }

  try {
    const payload = await decrypt(session)
    return payload?.user || null
  } catch (error) {
    return null
  }
}
