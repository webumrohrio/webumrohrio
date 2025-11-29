import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Fetch all travels with their credentials
    const travels = await prisma.travel.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        password: true,
        logo: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map travels and mask password (show only if it's plain text, otherwise show masked)
    const travelsWithMaskedPassword = travels.map(travel => ({
      ...travel,
      password: travel.password && travel.password.startsWith('$2') ? '••••••••' : (travel.password || '••••••••'), // If bcrypt hash, mask it
      isPasswordHashed: travel.password ? travel.password.startsWith('$2') : true
    }))

    return NextResponse.json({
      success: true,
      data: travelsWithMaskedPassword
    })
  } catch (error) {
    console.error('Error fetching travel admins:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data travel admin' },
      { status: 500 }
    )
  }
}
