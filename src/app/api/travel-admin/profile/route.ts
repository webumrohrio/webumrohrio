import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get travel profile
export async function GET(request: Request) {
  try {
    // Get travelId or username from query
    const { searchParams } = new URL(request.url)
    const travelId = searchParams.get('travelId')
    const username = searchParams.get('username')

    if (!travelId && !username) {
      return NextResponse.json({
        success: false,
        message: 'Travel ID atau username tidak ditemukan'
      }, { status: 400 })
    }

    // Get travel data (get all fields)
    const travel = await db.travel.findUnique({
      where: travelId ? { id: travelId } : { username: username! }
    })

    if (!travel) {
      return NextResponse.json({
        success: false,
        message: 'Travel tidak ditemukan'
      }, { status: 404 })
    }

    // Parse JSON fields
    const travelData = {
      ...travel,
      licenses: travel.licenses ? JSON.parse(travel.licenses) : [],
      facilities: travel.facilities ? JSON.parse(travel.facilities) : [],
      services: travel.services ? JSON.parse(travel.services) : [],
      gallery: travel.gallery ? JSON.parse(travel.gallery) : [],
      legalDocs: travel.legalDocs ? JSON.parse(travel.legalDocs) : []
    }

    // Return packageUsed from database field (permanent count)
    // This does NOT decrease when packages are deleted
    return NextResponse.json({
      success: true,
      data: {
        ...travelData,
        packageUsed: travel.packageUsed || 0
      }
    })

  } catch (error) {
    console.error('Get travel profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}

// PUT - Update travel profile
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { travelId, username, originalUsername, ...updateData } = body

    // Determine which identifier to use
    const identifier = originalUsername || username || travelId

    if (!identifier) {
      return NextResponse.json({
        success: false,
        message: 'Travel ID, username, atau originalUsername tidak ditemukan'
      }, { status: 400 })
    }

    // Find travel first
    const travel = await db.travel.findUnique({
      where: travelId ? { id: travelId } : { username: identifier }
    })

    if (!travel) {
      return NextResponse.json({
        success: false,
        message: 'Travel tidak ditemukan'
      }, { status: 404 })
    }

    // Check if username is being changed
    if (username && username !== travel.username) {
      // Validate username format
      if (username.length < 3) {
        return NextResponse.json({
          success: false,
          message: 'Username minimal 3 karakter'
        }, { status: 400 })
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json({
          success: false,
          message: 'Username hanya boleh mengandung huruf, angka, underscore, dan dash'
        }, { status: 400 })
      }

      // Check if new username is already taken
      const existingTravel = await db.travel.findUnique({
        where: { username }
      })

      if (existingTravel && existingTravel.id !== travel.id) {
        return NextResponse.json({
          success: false,
          message: 'Username sudah digunakan'
        }, { status: 400 })
      }
    }

    // Filter: Only allow specific fields to be updated
    // Remove packageLimit and isVerified from updateData to prevent travel admin from changing them
    const { packageLimit, isVerified, packageUsed, ...allowedData } = updateData
    
    // Stringify JSON fields if they exist
    const dataToUpdate: any = { ...allowedData }
    
    if (allowedData.licenses) {
      dataToUpdate.licenses = JSON.stringify(allowedData.licenses)
    }
    if (allowedData.facilities) {
      dataToUpdate.facilities = JSON.stringify(allowedData.facilities)
    }
    if (allowedData.services) {
      dataToUpdate.services = JSON.stringify(allowedData.services)
    }
    if (allowedData.gallery) {
      dataToUpdate.gallery = JSON.stringify(allowedData.gallery)
    }
    if (allowedData.legalDocs) {
      dataToUpdate.legalDocs = JSON.stringify(allowedData.legalDocs)
    }

    // Update travel
    const updatedTravel = await db.travel.update({
      where: { id: travel.id },
      data: dataToUpdate
    })

    // If username changed, update session
    if (username && username !== travel.username) {
      return NextResponse.json({
        success: true,
        message: 'Profil berhasil diupdate',
        data: updatedTravel,
        usernameChanged: true,
        newUsername: username
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diupdate',
      data: updatedTravel
    })

  } catch (error) {
    console.error('Update travel profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}
