import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required'
      }, { status: 400 })
    }

    // Check if username exists
    const existingTravel = await db.travel.findUnique({
      where: { username }
    })

    return NextResponse.json({
      success: true,
      available: !existingTravel,
      username
    })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check username'
    }, { status: 500 })
  }
}
