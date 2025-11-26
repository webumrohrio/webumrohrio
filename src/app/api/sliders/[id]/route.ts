import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET slider by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slider = await db.slider.findUnique({
      where: { id }
    })

    if (!slider) {
      return NextResponse.json({
        success: false,
        error: 'Slider not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: slider
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch slider'
    }, { status: 500 })
  }
}

// DELETE slider by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get slider data first to retrieve image path
    const slider = await db.slider.findUnique({
      where: { id }
    })

    if (!slider) {
      return NextResponse.json({
        success: false,
        error: 'Slider not found'
      }, { status: 404 })
    }

    // Delete slider from database
    await db.slider.delete({
      where: { id }
    })

    // Delete image file from filesystem if it exists
    if (slider.image && slider.image.startsWith('/uploads/')) {
      try {
        const fs = require('fs')
        const path = require('path')
        const filePath = path.join(process.cwd(), 'public', slider.image)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('Slider image deleted:', filePath)
        }
      } catch (fileError) {
        console.error('Failed to delete slider image:', fileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Slider and associated files deleted successfully'
    })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete slider'
    }, { status: 500 })
  }
}

// PUT update slider by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const slider = await db.slider.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link,
        targetCity: body.targetCity,
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        showOverlay: body.showOverlay !== undefined ? body.showOverlay : true,
        objectFit: body.objectFit || 'cover'
      }
    })

    return NextResponse.json({
      success: true,
      data: slider,
      message: 'Slider updated successfully'
    })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update slider'
    }, { status: 500 })
  }
}

// PATCH update specific fields (e.g., order only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const slider = await db.slider.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      data: slider,
      message: 'Slider updated successfully'
    })
  } catch (error) {
    console.error('PATCH Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update slider'
    }, { status: 500 })
  }
}
