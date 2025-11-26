import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const tags = searchParams.get('tags')
    const showAll = searchParams.get('showAll') // For admin to see all articles including drafts
    const slug = searchParams.get('slug') // Get article by slug
    const period = searchParams.get('period')

    // If slug is provided, return single article
    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug },
        include: {
          travel: {
            select: {
              id: true,
              name: true,
              logo: true,
              isVerified: true
            }
          },
          admin: {
            select: {
              id: true,
              name: true
            }
          }
        } as any
      })

      if (!article) {
        return NextResponse.json({
          success: false,
          message: 'Article not found'
        }, { status: 404 })
      }

      // Increment views
      await prisma.article.update({
        where: { slug },
        data: { views: { increment: 1 } }
      })

      return NextResponse.json({
        success: true,
        data: article
      })
    }

    // Calculate date range based on period
    let startDate: Date | undefined
    if (period) {
      const now = new Date()
      startDate = new Date()
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          startDate.setHours(0, 0, 0, 0)
          break
      }
    }

    // Build where clause for list
    const where: any = {}

    // Only filter by isPublished if not showing all (for public pages)
    if (showAll !== 'true') {
      where.isPublished = true
    }

    if (startDate) {
      where.createdAt = { gte: startDate }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tags) {
      where.tags = { contains: tags, mode: 'insensitive' }
    }

    // Fetch articles from database
    const articles = await prisma.article.findMany({
      where,
      include: {
        travel: {
          select: {
            id: true,
            name: true
          }
        },
        admin: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          select: {
            id: true
          }
        }
      } as any,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    })

    // Add comment count to each article
    const articlesWithCommentCount = articles.map(article => ({
      ...article,
      commentCount: article.comments?.length || 0,
      comments: undefined // Remove comments array from response
    }))

    return NextResponse.json({
      success: true,
      data: articlesWithCommentCount,
      total: articlesWithCommentCount.length
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch articles',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create article in database
    const newArticle = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || '',
        image: body.image,
        slug: body.slug,
        tags: body.tags || '',
        travelId: body.travelId || null,
        adminId: body.adminId || null,
        isPublished: body.isPublished || false,
        views: 0
      } as any,
      include: {
        travel: {
          select: {
            id: true,
            name: true
          }
        },
        admin: {
          select: {
            id: true,
            name: true
          }
        }
      } as any
    })

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Article created successfully'
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create article',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}