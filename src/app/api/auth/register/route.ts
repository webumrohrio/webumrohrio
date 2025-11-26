import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, dan nama wajib diisi'
      }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password minimal 6 karakter'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email sudah terdaftar'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Registrasi berhasil'
    })
  } catch (error) {
    console.error('Register Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
