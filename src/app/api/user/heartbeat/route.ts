import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST update user lastActive timestamp
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 })
    }

    // Update lastActive timestamp
    await db.user.update({
      where: { email },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: 'Heartbeat updated'
    })
  } catch (error) {
    console.error('Heartbeat Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update heartbeat'
    }, { status: 500 })
  }
}
