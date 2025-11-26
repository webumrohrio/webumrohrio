import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Delete the admin token cookie
    const cookieStore = await cookies()
    cookieStore.delete('admin-token')
    
    // Log successful logout
    console.log(`[SECURITY] Admin logout from IP: ${ip} at ${new Date().toISOString()}`)
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
}
