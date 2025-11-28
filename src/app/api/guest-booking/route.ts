import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET guest booking data by phone
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number is required'
      }, { status: 400 })
    }

    // @ts-ignore - GuestBooking model exists but TypeScript may not recognize it yet
    const guestBooking = await db.guestBooking.findUnique({
      where: { phone }
    })

    if (!guestBooking) {
      return NextResponse.json({
        success: false,
        message: 'Guest booking not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: guestBooking
    })
  } catch (error) {
    console.error('GET guest booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch guest booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST create or update guest booking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, defaultPax } = body

    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        message: 'Name and phone are required'
      }, { status: 400 })
    }

    // Validate phone number (basic validation)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number'
      }, { status: 400 })
    }

    // Upsert guest booking (create or update)
    // @ts-ignore - GuestBooking model exists but TypeScript may not recognize it yet
    const guestBooking = await db.guestBooking.upsert({
      where: { phone: cleanPhone },
      update: {
        name,
        defaultPax: defaultPax || 1,
        lastUsed: new Date()
      },
      create: {
        name,
        phone: cleanPhone,
        defaultPax: defaultPax || 1
      }
    })

    return NextResponse.json({
      success: true,
      data: guestBooking,
      message: 'Guest booking saved successfully'
    })
  } catch (error) {
    console.error('POST guest booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to save guest booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
