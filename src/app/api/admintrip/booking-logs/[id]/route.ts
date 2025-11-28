import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE booking log by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // @ts-ignore
    await db.bookingLog.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking log deleted successfully'
    })
  } catch (error) {
    console.error('DELETE booking log error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete booking log',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
