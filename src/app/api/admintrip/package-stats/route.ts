import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'day'

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Get packages created in the period
    const packages = await db.package.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        views: true,
        bookingClicks: true
      }
    })

    // Calculate totals
    const totalViews = packages.reduce((sum, pkg) => sum + pkg.views, 0)
    const totalBookings = packages.reduce((sum, pkg) => sum + pkg.bookingClicks, 0)

    // Get favorites count in the period
    const favoritesCount = await db.favorite.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        totalBookings,
        totalFavorites: favoritesCount
      }
    })
  } catch (error) {
    console.error('Failed to fetch package stats:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch package stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
