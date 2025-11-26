import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')

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

    const users = await prisma.user.findMany({
      where: startDate ? {
        createdAt: { gte: startDate }
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in response
      }
    })

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
