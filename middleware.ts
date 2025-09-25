import { type NextRequest, NextResponse } from "next/server"
import { decrypt } from "./lib/auth"

const protectedRoutes = ["/admin", "/agency", "/dashboard"]
const publicRoutes = ["/login", "/"]

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
      console.log('Middleware session:', path, session ? 'authenticated' : 'unauthenticated')
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

    // Role-based access control and user status check
    if (session) {
      // Check if user is still active (only for protected routes)
      if (isProtectedRoute) {
        try {
          const statusResponse = await fetch(new URL('/api/auth/check-status', req.nextUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email
            })
          })
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            if (!statusData.active) {
              const queryParam = statusData.reason === 'agency_deactivated' ? 'agency_deactivated=true' : 'deactivated=true'
              const response = NextResponse.redirect(new URL(`/login?${queryParam}`, req.nextUrl))
              response.cookies.delete("session")
              return response
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error)
          // Continue with normal flow if status check fails
        }
      }
      
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
