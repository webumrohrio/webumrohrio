import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { username, password, name, email, role, isActive } = body

    // Check if username is being changed and already exists
    if (username) {
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          username,
          NOT: { id: params.id }
        }
      })

      if (existingAdmin) {
        return NextResponse.json(
          { success: false, error: 'Username sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      name,
      email,
      role,
      isActive
    }

    if (username) updateData.username = username
    if (password) updateData.password = password // In production, hash this!

    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    console.log(`[ADMIN] Admin updated: ${admin.username}`)

    return NextResponse.json({
      success: true,
      data: admin
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    )
  }
}

// DELETE - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is the last admin
    const adminCount = await prisma.admin.count()
    
    if (adminCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus admin terakhir' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.delete({
      where: { id: params.id }
    })

    console.log(`[ADMIN] Admin deleted: ${admin.username}`)

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
