import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get comments for an article
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({
        success: false,
        message: 'Article ID is required'
      }, { status: 400 })
    }

    const comments = await prisma.articleComment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch comments'
    }, { status: 500 })
  }
}

// POST - Add a comment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { articleId, userId, comment } = body

    if (!articleId || !userId || !comment) {
      return NextResponse.json({
        success: false,
        message: 'Article ID, User ID, and comment are required'
      }, { status: 400 })
    }

    const newComment = await prisma.articleComment.create({
      data: {
        articleId,
        userId,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to add comment'
    }, { status: 500 })
  }
}

// DELETE - Delete a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Comment ID and User ID are required'
      }, { status: 400 })
    }

    // Check if comment belongs to user
    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({
        success: false,
        message: 'Comment not found'
      }, { status: 404 })
    }

    if (comment.userId !== userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to delete this comment'
      }, { status: 403 })
    }

    await prisma.articleComment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete comment'
    }, { status: 500 })
  }
}
