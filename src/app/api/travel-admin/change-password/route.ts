import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { travelId, currentPassword, newPassword } = body

    // Validate input
    if (!travelId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Find travel
    const travel = await prisma.travel.findUnique({
      where: { id: travelId }
    })

    if (!travel) {
      return NextResponse.json(
        { success: false, error: 'Travel tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify current password
    if (!travel.password) {
      return NextResponse.json(
        { success: false, error: 'Password belum diset' },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, travel.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Password lama salah' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.travel.update({
      where: { id: travelId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
