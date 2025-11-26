import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET user's preferred location
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLocation: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        location: user?.preferredLocation || null
      }
    })
  } catch (error) {
    console.error('Error fetching user location:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch location'
    }, { status: 500 })
  }
}

// POST/UPDATE user's preferred location
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated'
      }, { status: 401 })
    }

    const { location } = await request.json()

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'Location is required'
      }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferredLocation: location }
    })

    return NextResponse.json({
      success: true,
      data: {
        location: user.preferredLocation
      }
    })
  } catch (error) {
    console.error('Error updating user location:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update location'
    }, { status: 500 })
  }
}
