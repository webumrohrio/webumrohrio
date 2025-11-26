import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET user profile by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Update lastActive timestamp
    await db.user.update({
      where: { email },
      data: { lastActive: new Date() }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('GET Profile Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT update user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, name, phone, avatar } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 })
    }

    // Update user
    const user = await db.user.update({
      where: { email },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('PUT Profile Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
