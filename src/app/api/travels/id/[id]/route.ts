import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET travel by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const travel = await db.travel.findUnique({
      where: {
        id
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
    console.error('Error fetching travel:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch travel'
    }, { status: 500 })
  }
}

// UPDATE travel by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log('📥 Received body.packageLimit:', body.packageLimit, typeof body.packageLimit)
    
    // Prepare travel data
    const travelData: any = {
      name: body.name,
      description: body.description,
      logo: body.logo,
      coverImage: body.coverImage,
      address: body.address,
      city: body.city,
      phone: body.phone,
      email: body.email,
      website: body.website,
      rating: body.rating || 0,
      totalReviews: body.totalReviews || 0,
      totalJamaah: body.totalJamaah || 0,
      yearEstablished: body.yearEstablished,
      packageLimit: body.packageLimit !== undefined ? body.packageLimit : 10,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isVerified: body.isVerified !== undefined ? body.isVerified : false
    }
    
    console.log('💾 Saving travelData.packageLimit:', travelData.packageLimit)

    // Convert arrays to JSON strings
    if (body.licenses) {
      travelData.licenses = JSON.stringify(body.licenses)
    }
    if (body.facilities) {
      travelData.facilities = JSON.stringify(body.facilities)
    }
    if (body.services) {
      travelData.services = JSON.stringify(body.services)
    }
    if (body.gallery) {
      travelData.gallery = JSON.stringify(body.gallery)
    }
    if (body.legalDocs) {
      travelData.legalDocs = JSON.stringify(body.legalDocs)
    }

    // Update travel in database
    const updatedTravel = await db.travel.update({
      where: {
        id
      },
      data: travelData
    })

    return NextResponse.json({
      success: true,
      data: updatedTravel,
      message: 'Travel updated successfully'
    })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update travel',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// DELETE travel by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if travel exists
    const travel = await db.travel.findUnique({
      where: {
        id
      },
      include: {
        packages: true,
        articles: true
      }
    })

    if (!travel) {
      return NextResponse.json({
        success: false,
        error: 'Travel not found'
      }, { status: 404 })
    }

    // Check if travel has related packages or articles
    if (travel.packages.length > 0 || travel.articles.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete travel. It has ${travel.packages.length} package(s) and ${travel.articles.length} article(s) associated with it. Please delete them first.`
      }, { status: 400 })
    }

    // Delete travel from database
    await db.travel.delete({
      where: {
        id
      }
    })

    // Delete image files from filesystem
    const fs = require('fs')
    const path = require('path')
    const filesToDelete: string[] = []

    // Add logo to delete list
    if (travel.logo && travel.logo.startsWith('/uploads/')) {
      filesToDelete.push(travel.logo)
    }

    // Add cover image to delete list
    if (travel.coverImage && travel.coverImage.startsWith('/uploads/')) {
      filesToDelete.push(travel.coverImage)
    }

    // Add gallery images to delete list
    if (travel.gallery) {
      try {
        const gallery = JSON.parse(travel.gallery)
        if (Array.isArray(gallery)) {
          gallery.forEach((item: any) => {
            const imageUrl = typeof item === 'string' ? item : item.url
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
              filesToDelete.push(imageUrl)
            }
          })
        }
      } catch (parseError) {
        console.error('Failed to parse gallery:', parseError)
      }
    }

    // Delete all files
    for (const fileUrl of filesToDelete) {
      try {
        const filePath = path.join(process.cwd(), 'public', fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('Travel image deleted:', filePath)
        }
      } catch (fileError) {
        console.error('Failed to delete file:', fileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Travel and associated files deleted successfully'
    })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete travel'
    }, { status: 500 })
  }
}

// PATCH - Reset password or quota for travel admin
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newPassword, packageUsed } = body
    
    // Handle password reset
    if (newPassword !== undefined) {
      // Validate password
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          error: 'Password baru minimal 6 karakter'
        }, { status: 400 })
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      // Update password in database
      await db.travel.update({
        where: { id },
        data: { password: hashedPassword }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Password berhasil direset'
      })
    }
    
    // Handle quota reset
    if (packageUsed !== undefined) {
      // Validate packageUsed value
      if (typeof packageUsed !== 'number' || packageUsed < 0) {
        return NextResponse.json({
          success: false,
          error: 'Nilai packageUsed tidak valid'
        }, { status: 400 })
      }
      
      // Update packageUsed in database
      await db.travel.update({
        where: { id },
        data: { packageUsed }
      })
      
      console.log(`✅ Reset packageUsed for travel ${id} to ${packageUsed}`)
      
      return NextResponse.json({
        success: true,
        message: 'Kuota berhasil direset'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Tidak ada data yang diupdate'
    }, { status: 400 })
  } catch (error) {
    console.error('PATCH Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal melakukan update'
    }, { status: 500 })
  }
}
