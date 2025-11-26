import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET user favorites
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

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Get user favorites with package details
    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Get package IDs
    const packageIds = favorites.map(f => f.packageId)

    return NextResponse.json({
      success: true,
      data: packageIds
    })
  } catch (error) {
    console.error('GET Favorites Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST add to favorites
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, packageId } = body

    if (!email || !packageId) {
      return NextResponse.json({
        success: false,
        message: 'Email and packageId are required'
      }, { status: 400 })
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_packageId: {
          userId: user.id,
          packageId: packageId
        }
      }
    })

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Already in favorites'
      }, { status: 400 })
    }

    // Add to favorites
    await db.favorite.create({
      data: {
        userId: user.id,
        packageId: packageId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Added to favorites'
    })
  } catch (error) {
    console.error('POST Favorites Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to add to favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE remove from favorites
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const packageId = searchParams.get('packageId')

    if (!email || !packageId) {
      return NextResponse.json({
        success: false,
        message: 'Email and packageId are required'
      }, { status: 400 })
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Remove from favorites
    await db.favorite.deleteMany({
      where: {
        userId: user.id,
        packageId: packageId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })
  } catch (error) {
    console.error('DELETE Favorites Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to remove from favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
