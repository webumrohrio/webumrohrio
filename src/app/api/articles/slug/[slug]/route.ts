import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch article by slug and increment views
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        travel: {
          select: {
            id: true,
            username: true,
            name: true,
            logo: true,
            isVerified: true,
            city: true
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.article.update({
      where: { id: article.id },
      data: { views: article.views + 1 }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        views: article.views + 1
      }
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
