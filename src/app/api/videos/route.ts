import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')

    const where: any = {}

    // Filter by location if provided
    if (location) {
      where.OR = [
        { location: location },
        { location: null } // Include videos without specific location
      ]
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: videos
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

// POST - Create new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, youtubeUrl, videoId, thumbnail, location, isActive } = body

    if (!title || !youtubeUrl || !videoId) {
      return NextResponse.json(
        { success: false, error: 'Title, YouTube URL, and Video ID are required' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        youtubeUrl,
        videoId,
        thumbnail: thumbnail || '',
        location: location || null,
        isActive: isActive !== undefined ? isActive : true
      } as any
    })

    return NextResponse.json({
      success: true,
      data: video
    })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    )
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      )
    }

    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
