import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET package by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if this is a request from admin panel (skip view tracking)
    const { searchParams } = new URL(request.url)
    const skipTracking = searchParams.get('skipTracking') === 'true'
    
    // Only track views if not from admin panel
    if (!skipTracking) {
      // Get IP address and user agent for tracking
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      // Increment views count and log the view
      await Promise.all([
        db.package.update({
          where: { id },
          data: {
            views: {
              increment: 1
            }
          } as any
        }),
        // @ts-ignore - PackageView model exists but TypeScript may not recognize it yet
        db.packageView.create({
          data: {
            packageId: id,
            ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
            userAgent: userAgent.substring(0, 255) // Limit length
          }
        })
      ])
    }
    
    const packageData = await db.package.findUnique({
      where: { id },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            rating: true,
            logo: true,
            city: true,
            username: true,
            isVerified: true,
            phone: true
          }
        }
      }
    })

    if (!packageData) {
      return NextResponse.json({
        success: false,
        error: 'Package not found'
      }, { status: 404 })
    }

    // Parse JSON fields
    const parsedPackage = {
      ...packageData,
      facilities: packageData.facilities ? JSON.parse(packageData.facilities) : [],
      includes: packageData.includes ? JSON.parse(packageData.includes) : [],
      excludes: packageData.excludes ? JSON.parse(packageData.excludes) : [],
      priceOptions: packageData.priceOptions ? JSON.parse(packageData.priceOptions) : [],
      itinerary: packageData.itinerary ? JSON.parse(packageData.itinerary) : []
    }

    return NextResponse.json({
      success: true,
      data: parsedPackage
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch package'
    }, { status: 500 })
  }
}

// PUT update package by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verify ownership: Check if package belongs to the travelId in request
    if (body.travelId) {
      const existingPackage = await db.package.findUnique({
        where: { id },
        select: { travelId: true, name: true, slug: true }
      })

      if (!existingPackage) {
        return NextResponse.json({
          success: false,
          error: 'Package not found'
        }, { status: 404 })
      }

      // Prevent changing travelId to another travel
      if (existingPackage.travelId !== body.travelId) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: Cannot transfer package to another travel'
        }, { status: 403 })
      }
    }

    // Auto-generate slug from name if name changed
    let slug = body.slug
    const existingPkg = await db.package.findUnique({
      where: { id },
      select: { name: true, slug: true }
    })

    // If name changed, generate new slug
    if (existingPkg && body.name && body.name !== existingPkg.name) {
      // Generate base slug from name
      let baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()

      slug = baseSlug
      let counter = 1

      // Check uniqueness and add number if needed
      while (true) {
        const existing = await db.package.findUnique({
          where: { slug }
        })

        // If slug doesn't exist, or it's the current package, use it
        if (!existing || existing.id === id) {
          break
        }

        // Slug exists, try with number
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Calculate lowest price and highest cashback from priceOptions
    let price = body.price || 0
    let originalPrice = body.originalPrice
    let cashback = body.cashback || 0

    if (body.priceOptions && body.priceOptions.length > 0) {
      const lowestPriceOption = body.priceOptions.reduce((min: any, option: any) => 
        option.price < min.price ? option : min
      )
      price = lowestPriceOption.price
      originalPrice = lowestPriceOption.originalPrice

      const highestCashback = Math.max(...body.priceOptions.map((opt: any) => opt.cashback || 0))
      cashback = highestCashback
    }

    // Update package in database
    const updatedPackage = await db.package.update({
      where: { id },
      data: {
        name: body.name,
        slug: slug, // Use auto-generated slug
        description: body.description,
        image: body.image,
        price,
        originalPrice,
        cashback,
        duration: body.duration,
        departureCity: body.departureCity,
        departureDate: new Date(body.departureDate),
        quota: body.quota || 45,
        quotaAvailable: body.quotaAvailable || body.quota || 45,
        category: body.category || 'reguler',
        flightType: body.flightType || 'langsung',
        isBestSeller: body.isBestSeller || false,
        facilities: JSON.stringify(body.facilities || []),
        includes: JSON.stringify(body.includes || []),
        excludes: JSON.stringify(body.excludes || []),
        priceOptions: JSON.stringify(body.priceOptions || []),
        itinerary: JSON.stringify(body.itinerary || []),
        isActive: body.isActive !== undefined ? body.isActive : true,
        travelId: body.travelId
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            rating: true,
            logo: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully'
    })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update package'
    }, { status: 500 })
  }
}

// PATCH package (for partial updates like pin toggle)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // If toggling pin status, set pinnedAt timestamp
    if ('isPinned' in body) {
      if (body.isPinned) {
        body.pinnedAt = new Date()
      } else {
        body.pinnedAt = null
      }
    }

    // Update only the fields provided in the request
    const updatedPackage = await db.package.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully'
    })
  } catch (error) {
    console.error('PATCH Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update package'
    }, { status: 500 })
  }
}

// DELETE package by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get package data first to retrieve image path and verify ownership
    const packageData = await db.package.findUnique({
      where: { id },
      include: {
        travel: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (!packageData) {
      return NextResponse.json({
        success: false,
        error: 'Package not found'
      }, { status: 404 })
    }

    // Note: In production, you should verify the session/token here
    // to ensure the logged-in travel admin owns this package
    // For now, we rely on frontend filtering, but this should be enhanced

    // Delete package from database
    await db.package.delete({
      where: { id }
    })

    // Delete image file from filesystem if it exists
    if (packageData.image && packageData.image.startsWith('/uploads/')) {
      try {
        const fs = require('fs')
        const path = require('path')
        const filePath = path.join(process.cwd(), 'public', packageData.image)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('Image file deleted:', filePath)
        }
      } catch (fileError) {
        console.error('Failed to delete image file:', fileError)
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Package and associated files deleted successfully'
    })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete package'
    }, { status: 500 })
  }
}
