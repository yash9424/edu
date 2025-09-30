import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const protectedRoutes = ["/admin", "/agency", "/dashboard"]
const publicRoutes = ["/login", "/"]

const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const key = new TextEncoder().encode(secretKey)

async function decrypt(input: string | undefined): Promise<any> {
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

export default async function middleware(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
    const isPublicRoute = publicRoutes.includes(path)
    const isApiRoute = path.startsWith("/api/")

    // Skip middleware for API routes except auth-related ones
    if (isApiRoute && !path.startsWith("/api/auth/")) {
      return NextResponse.next()
    }

    const cookie = req.cookies.get("session")?.value
    let session = null
    
    try {
      session = cookie ? await decrypt(cookie) : null
    } catch (error) {
      console.error('Session decrypt error:', error)
      // Invalid session, clear it
      const response = NextResponse.redirect(new URL("/login", req.nextUrl))
      response.cookies.delete("session")
      return response
    }

    // Handle root path redirect logic in middleware to prevent loops
    if (path === "/") {
      if (session) {
        const redirectPath = session.user.role === "admin" ? "/admin" : "/agency"
        return NextResponse.redirect(new URL(redirectPath, req.nextUrl))
      }
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // Always allow access to login page
    if (path === "/login") {
      if (session) {
        const redirectPath = session.user.role === "admin" ? "/admin" : "/agency"
        return NextResponse.redirect(new URL(redirectPath, req.nextUrl))
      }
      return NextResponse.next()
    }

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // Role-based access control
    if (session) {
      // Only redirect if user is trying to access the wrong dashboard
      if (path.startsWith("/admin") && session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/agency", req.nextUrl))
      }
      if (path.startsWith("/agency") && session.user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\.png$).*)"],
}
