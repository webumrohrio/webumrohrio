import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update travel password
    const updatedTravel = await prisma.travel.update({
      where: { id: params.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset',
      data: updatedTravel
    })
  } catch (error) {
    console.error('Error resetting travel password:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal reset password' },
      { status: 500 }
    )
  }
}
