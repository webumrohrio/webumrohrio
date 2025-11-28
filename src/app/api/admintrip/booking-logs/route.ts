import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all booking logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const period = searchParams.get('period')
    const skip = (page - 1) * pageSize

    // Calculate date range based on period
    let startDate: Date | undefined
    if (period) {
      const now = new Date()
      startDate = new Date()
      
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
    }

    // Build where clause
    const whereClause = startDate ? {
      createdAt: {
        gte: startDate
      }
    } : {}

    // Get total count
    // @ts-ignore
    const totalCount = await db.bookingLog.count({
      where: whereClause
    })

    // Get booking logs with pagination
    // @ts-ignore
    const bookingLogs = await db.bookingLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    })

    const totalPages = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      success: true,
      data: bookingLogs,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('GET booking logs error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch booking logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST create booking log
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, pax, packageId, packageName, selectedPackageName, packagePrice, travelName, travelUsername, isGuest, userId } = body

    if (!name || !phone || !pax || !packageId || !packageName || !travelName) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 })
    }

    // Create booking log
    // @ts-ignore
    const bookingLog = await db.bookingLog.create({
      data: {
        name,
        phone,
        pax,
        packageId,
        packageName,
        selectedPackageName: selectedPackageName || null,
        packagePrice: packagePrice || null,
        travelName,
        travelUsername: travelUsername || null,
        isGuest: isGuest !== undefined ? isGuest : true,
        userId: userId || null
      }
    })

    return NextResponse.json({
      success: true,
      data: bookingLog,
      message: 'Booking log created successfully'
    })
  } catch (error) {
    console.error('POST booking log error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create booking log',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
