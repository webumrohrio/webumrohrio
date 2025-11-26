import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // Get specific setting
      const setting = await prisma.settings.findUnique({
        where: { key }
      })

      return NextResponse.json({
        success: true,
        data: setting
      })
    } else {
      // Get all settings
      const settings = await prisma.settings.findMany()
      
      return NextResponse.json({
        success: true,
        data: settings
      })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key is required' },
        { status: 400 }
      )
    }

    // If value is empty, delete the setting
    if (!value || value.trim() === '') {
      try {
        await prisma.settings.delete({
          where: { key }
        })
        return NextResponse.json({
          success: true,
          message: 'Setting deleted'
        })
      } catch (error) {
        // Setting doesn't exist, that's ok
        return NextResponse.json({
          success: true,
          message: 'Setting not found or already deleted'
        })
      }
    }

    // Upsert (create or update)
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json({
      success: true,
      data: setting
    })
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save setting' },
      { status: 500 }
    )
  }
}
