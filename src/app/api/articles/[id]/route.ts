import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            logo: true,
            isVerified: true
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

    return NextResponse.json({
      success: true,
      data: article
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, excerpt, image, slug, tags, travelId, isPublished } = body

    // Check if slug is being changed and already exists
    if (slug) {
      const existingArticle = await prisma.article.findFirst({
        where: {
          slug,
          NOT: { id: params.id }
        }
      })

      if (existingArticle) {
        return NextResponse.json(
          { success: false, error: 'Slug sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        content,
        excerpt,
        image,
        slug,
        tags,
        travelId,
        isPublished
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            logo: true,
            isVerified: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: article
    })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get article data first to retrieve image paths
    const article = await prisma.article.findUnique({
      where: { id: params.id }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Delete article from database
    await prisma.article.delete({
      where: { id: params.id }
    })

    // Delete image files from filesystem
    const fs = require('fs')
    const path = require('path')
    const filesToDelete: string[] = []

    // Add image to delete list
    if (article.image && article.image.startsWith('/uploads/')) {
      filesToDelete.push(article.image)
    }

    // Add thumbnail to delete list (if exists in schema)
    const articleData = article as any
    if (articleData.thumbnail && articleData.thumbnail.startsWith('/uploads/')) {
      filesToDelete.push(articleData.thumbnail)
    }

    // Delete all files
    for (const fileUrl of filesToDelete) {
      try {
        const filePath = path.join(process.cwd(), 'public', fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('Image file deleted:', filePath)
        }
      } catch (fileError) {
        console.error('Failed to delete file:', fileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Article and associated files deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
