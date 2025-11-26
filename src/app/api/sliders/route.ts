import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all sliders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetCity = searchParams.get('targetCity')

    const where: any = {}

    // Filter by target city if provided
    if (targetCity && targetCity !== 'all') {
      where.OR = [
        { targetCity: null }, // Show sliders for all cities
        { targetCity: targetCity } // Show sliders for specific city
      ]
    }

    const sliders = await db.slider.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: sliders
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sliders'
    }, { status: 500 })
  }
}

// POST create new slider
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slider = await db.slider.create({
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link,
        targetCity: body.targetCity,
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        showOverlay: body.showOverlay !== undefined ? body.showOverlay : true
      }
    })

    return NextResponse.json({
      success: true,
      data: slider,
      message: 'Slider created successfully'
    })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create slider'
    }, { status: 500 })
  }
}
