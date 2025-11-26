import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Increment booking clicks
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Increment booking clicks count
    await db.package.update({
      where: { id },
      data: {
        bookingClicks: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking click tracked'
    })
  } catch (error) {
    console.error('Booking click tracking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to track booking click'
    }, { status: 500 })
  }
}
