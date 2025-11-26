import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // In a real app, you would:
    // 1. Clear server-side session
    // 2. Invalidate JWT token
    // 3. Clear cookies
    
    // For now, we'll just return success
    // Client will clear localStorage
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })

  } catch (error) {
    console.error('Travel logout error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}
