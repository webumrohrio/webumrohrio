import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Check if article is favorited or get all favorites
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const articleId = searchParams.get('articleId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    // Check specific article
    if (articleId) {
      const favorite = await prisma.articleFavorite.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId
          }
        }
      })

      return NextResponse.json({
        success: true,
        isFavorite: !!favorite
      })
    }

    // Get all favorites for user
    const favorites = await prisma.articleFavorite.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            travel: {
              select: {
                name: true,
                logo: true
              }
            },
            admin: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('Error fetching article favorites:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch favorites'
    }, { status: 500 })
  }
}

// POST - Add to favorites
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, articleId } = body

    if (!userId || !articleId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Article ID are required'
      }, { status: 400 })
    }

    const favorite = await prisma.articleFavorite.create({
      data: {
        userId,
        articleId
      }
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Article added to favorites'
    })
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'Article already in favorites'
      }, { status: 400 })
    }

    console.error('Error adding to favorites:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to add to favorites'
    }, { status: 500 })
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const articleId = searchParams.get('articleId')

    if (!userId || !articleId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Article ID are required'
      }, { status: 400 })
    }

    await prisma.articleFavorite.delete({
      where: {
        userId_articleId: {
          userId,
          articleId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article removed from favorites'
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to remove from favorites'
    }, { status: 500 })
  }
}
