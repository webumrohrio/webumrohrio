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

    // Try to get data from new log tables (if they exist)
    let totalViews = 0
    let totalBookings = 0
    let useLogTables = false

    try {
      // Check if log tables exist by trying to query them
      // @ts-ignore - PackageView model exists but TypeScript may not recognize it yet
      const viewsCount = await db.packageView.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
      
      // @ts-ignore - PackageBookingClick model exists but TypeScript may not recognize it yet
      const bookingsCount = await db.packageBookingClick.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })

      totalViews = viewsCount
      totalBookings = bookingsCount
      useLogTables = true
    } catch (error) {
      // Log tables don't exist yet, fall back to cumulative counters
      console.log('Log tables not found, using cumulative counters')
      
      const packages = await db.package.findMany({
        select: {
          views: true,
          bookingClicks: true
        }
      })

      totalViews = packages.reduce((sum, pkg) => sum + pkg.views, 0)
      totalBookings = packages.reduce((sum, pkg) => sum + pkg.bookingClicks, 0)
    }

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
        totalFavorites: favoritesCount,
        useLogTables // Indicates if period-accurate data is available
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
