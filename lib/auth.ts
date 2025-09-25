import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

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
    console.log('JWT decrypt error:', error)
    return null
  }
}

export async function createSession(user: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: false, // Allow HTTP for local development
    sameSite: "lax",
    path: "/",
  })
  
  console.log('Session cookie set for user:', user.email)
}

export async function getSession(): Promise<any | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    console.log('No session cookie found')
    return null
  }

  try {
    const payload = await decrypt(session)
    console.log('Session found for user:', payload?.user?.email)
    return payload.user
  } catch (error) {
    console.log('Session decrypt failed:', error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function verifyAuth(request: Request): Promise<any | null> {
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