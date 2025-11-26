import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const travel = await db.travel.findUnique({
      where: {
        username: username
      }
    })

    if (!travel) {
      return NextResponse.json({
        success: false,
        error: 'Travel not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: travel
    })
  } catch (error) {
    console.error('Error fetching travel detail:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch travel detail'
    }, { status: 500 })
  }
}
