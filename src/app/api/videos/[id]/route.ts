import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, youtubeUrl, videoId, thumbnail, location, isActive } = body

    if (!title || !youtubeUrl || !videoId) {
      return NextResponse.json(
        { success: false, error: 'Title, YouTube URL, and Video ID are required' },
        { status: 400 }
      )
    }

    const video = await prisma.video.update({
      where: { id },
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
    console.error('Error updating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

// DELETE - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
