import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

export async function GET(request: NextRequest) {
  try {
    // Get admin ID from cookie
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin-id')?.value

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No admin session' },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true
      }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: admin
    })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin profile' },
      { status: 500 }
    )
  }
}
