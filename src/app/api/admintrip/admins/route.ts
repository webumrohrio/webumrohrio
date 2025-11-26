import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all admins
export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
        // Don't include password
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: admins
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, name, email, role } = body

    // Check if username already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    // In production, hash the password!
    // const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        username,
        password, // In production, use hashedPassword
        name,
        email: email || null,
        role: role || 'admin',
        isActive: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    console.log(`[ADMIN] New admin created: ${username} by system`)

    return NextResponse.json({
      success: true,
      data: admin
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}
