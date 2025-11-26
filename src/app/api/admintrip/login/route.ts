import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient() as any

// Rate limiting storage
const loginAttempts = new Map<string, { count: number; resetTime: number; lastAttempt: number }>()

// Clean up old entries
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(ip)
    }
  }
}, 3600000) // Every hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    
    // Check rate limiting
    const attempts = loginAttempts.get(ip)
    
    if (attempts) {
      // Check if still in lockout period
      if (now < attempts.resetTime && attempts.count >= 5) {
        const remainingTime = Math.ceil((attempts.resetTime - now) / 60000)
        return NextResponse.json(
          { 
            success: false, 
            error: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingTime} menit.` 
          },
          { status: 429 }
        )
      }
      
      // Check if reset time has passed
      if (now > attempts.resetTime) {
        loginAttempts.delete(ip)
      }
      
      // Check for rapid attempts (less than 2 seconds between attempts)
      if (now - attempts.lastAttempt < 2000) {
        return NextResponse.json(
          { success: false, error: 'Tunggu beberapa detik sebelum mencoba lagi.' },
          { status: 429 }
        )
      }
    }
    
    // Validate credentials from database
    const admin = await prisma.admin.findUnique({
      where: { username }
    })
    
    // Check if admin exists and is active
    if (!admin) {
      // Record failed attempt
      const resetTime = now + 900000
      if (attempts) {
        attempts.count++
        attempts.lastAttempt = now
        if (attempts.count >= 5) {
          attempts.resetTime = resetTime
        }
      } else {
        loginAttempts.set(ip, { count: 1, resetTime, lastAttempt: now })
      }
      
      console.warn(`[SECURITY] Failed admin login attempt (user not found) from IP: ${ip} at ${new Date().toISOString()}`)
      
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      )
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      console.warn(`[SECURITY] Login attempt for inactive admin: ${username} from IP: ${ip}`)
      return NextResponse.json(
        { success: false, error: 'Akun admin tidak aktif. Hubungi administrator.' },
        { status: 403 }
      )
    }
    
    // Validate password - support both plain text (legacy) and hashed passwords
    let isPasswordValid = false
    
    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (admin.password.startsWith('$2')) {
      // Use bcrypt compare for hashed passwords
      isPasswordValid = await bcrypt.compare(password, admin.password)
    } else {
      // Plain text comparison for legacy passwords
      isPasswordValid = admin.password === password
    }
    
    if (isPasswordValid) {
      // Successful login - clear attempts
      loginAttempts.delete(ip)
      
      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      })
      
      // Generate session token with admin ID
      const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')
      
      // Set secure cookie
      const cookieStore = await cookies()
      cookieStore.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 8, // 8 hours
        path: '/'
      })
      
      // Also set admin ID for middleware
      cookieStore.set('admin-id', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 8,
        path: '/'
      })
      
      // Log successful login
      console.log(`[SECURITY] Successful admin login: ${username} (${admin.name}) from IP: ${ip} at ${new Date().toISOString()}`)
      
      return NextResponse.json({
        success: true,
        message: 'Login berhasil',
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      })
    } else {
      // Failed login - record attempt
      const resetTime = now + 900000 // 15 minutes lockout
      
      if (attempts) {
        attempts.count++
        attempts.lastAttempt = now
        if (attempts.count >= 5) {
          attempts.resetTime = resetTime
        }
      } else {
        loginAttempts.set(ip, { 
          count: 1, 
          resetTime, 
          lastAttempt: now 
        })
      }
      
      const remainingAttempts = Math.max(0, 5 - (attempts?.count || 1))
      
      // Log failed login attempt
      console.warn(`[SECURITY] Failed admin login attempt from IP: ${ip} at ${new Date().toISOString()}`)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username atau password salah',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : undefined
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
