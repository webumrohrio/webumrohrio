import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    // Find travel by username
    const travel = await prisma.travel.findUnique({
      where: { username: username.toLowerCase() }
    })

    if (!travel) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Check if travel is active
    if (!travel.isActive) {
      return NextResponse.json(
        { success: false, error: 'Akun Anda tidak aktif. Hubungi admin.' },
        { status: 403 }
      )
    }

    // Check if password exists
    if (!travel.password) {
      return NextResponse.json(
        { success: false, error: 'Password belum diset. Hubungi admin.' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, travel.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.travel.update({
      where: { id: travel.id },
      data: { lastLogin: new Date() }
    })

    // Return travel data (without password)
    const { password: _, ...travelData } = travel

    return NextResponse.json({
      success: true,
      data: travelData,
      message: 'Login berhasil'
    })

  } catch (error) {
    console.error('Travel admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
