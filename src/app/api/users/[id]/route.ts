import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// PATCH - Update user password
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    const updatedUser = await db.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Error updating user password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user and all related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user avatar file if exists
    if (user.avatar) {
      try {
        const avatarPath = path.join(process.cwd(), 'public', user.avatar)
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath)
        }
      } catch (error) {
        console.error('Error deleting avatar file:', error)
        // Continue even if file deletion fails
      }
    }

    // Count related data before deletion for logging
    const [favoritesCount, articleFavoritesCount, commentsCount] = await Promise.all([
      db.favorite.count({ where: { userId: id } }),
      db.$queryRaw`SELECT COUNT(*) as count FROM ArticleFavorite WHERE userId = ${id}`.then((r: any) => r[0]?.count || 0),
      db.$queryRaw`SELECT COUNT(*) as count FROM ArticleComment WHERE userId = ${id}`.then((r: any) => r[0]?.count || 0)
    ])

    // Delete user - cascade delete will handle related data automatically
    // because of onDelete: Cascade in schema
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'User and all related data deleted successfully',
      data: {
        deletedUser: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        deletedData: {
          favorites: favoritesCount,
          articleFavorites: articleFavoritesCount,
          comments: commentsCount
        }
      }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
