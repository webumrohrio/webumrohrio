import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(ip)
    }
  }
}, 3600000)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect admintrip routes
  if (pathname.startsWith('/admintrip')) {
    // Check if trying to access login page
    if (pathname === '/admintrip/login') {
      // Rate limiting for login attempts
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const now = Date.now()
      const attempts = loginAttempts.get(ip)
      
      if (attempts) {
        if (now < attempts.resetTime) {
          if (attempts.count >= 5) {
            // Too many attempts, block for 15 minutes
            return NextResponse.json(
              { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
              { status: 429 }
            )
          }
        } else {
          // Reset time has passed, reset counter
          loginAttempts.delete(ip)
        }
      }
      
      return NextResponse.next()
    }
    
    // For other admintrip routes, check authentication
    const token = request.cookies.get('admin-token')?.value
    const adminId = request.cookies.get('admin-id')?.value
    
    if (!token && pathname !== '/admintrip/login') {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/admintrip/login', request.url))
    }
    
    // Clone request headers and add admin ID
    const requestHeaders = new Headers(request.headers)
    if (adminId) {
      requestHeaders.set('x-admin-id', adminId)
    }
    
    // Add security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    return response
  }
  
  // Redirect old /admin path to 404 (hide the fact that admintrip exists)
  if (pathname.startsWith('/admin')) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admintrip/:path*',
    '/admin/:path*'
  ]
}

// Helper function to record login attempt (call this from login API)
export function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now()
  const resetTime = now + 900000 // 15 minutes
  
  const attempts = loginAttempts.get(ip)
  
  if (success) {
    // Successful login, clear attempts
    loginAttempts.delete(ip)
  } else {
    // Failed login, increment counter
    if (attempts) {
      attempts.count++
    } else {
      loginAttempts.set(ip, { count: 1, resetTime })
    }
  }
}
