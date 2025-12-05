import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, travelId } = body

    if (!packageId || !travelId) {
      return NextResponse.json(
        { success: false, error: 'Package ID and Travel ID are required' },
        { status: 400 }
      )
    }

    // Get the original package
    const originalPackage = await prisma.package.findUnique({
      where: { id: packageId }
    })

    if (!originalPackage) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    // Check if travel owns this package
    if (originalPackage.travelId !== travelId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get travel info to check package limit
    const travel = await prisma.travel.findUnique({
      where: { id: travelId },
      select: { packageLimit: true, packageUsed: true }
    })

    if (!travel) {
      return NextResponse.json(
        { success: false, error: 'Travel not found' },
        { status: 404 }
      )
    }

    // Check package limit (999 means unlimited)
    if (travel.packageLimit !== 999 && travel.packageUsed >= travel.packageLimit) {
      return NextResponse.json(
        { success: false, error: 'Package limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Generate new slug
    const baseSlug = originalPackage.slug || originalPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let newSlug = `${baseSlug}-copy`
    let counter = 1
    
    // Check if slug exists and increment
    while (await prisma.package.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${baseSlug}-copy-${counter}`
      counter++
    }

    // Create duplicated package
    const duplicatedPackage = await prisma.package.create({
      data: {
        name: `${originalPackage.name} (Copy)`,
        slug: newSlug,
        description: originalPackage.description,
        image: originalPackage.image,
        price: originalPackage.price,
        originalPrice: originalPackage.originalPrice,
        cashback: originalPackage.cashback,
        duration: originalPackage.duration,
        departureCity: originalPackage.departureCity,
        departureDate: new Date(), // Set to today, admin will change this
        quota: 50, // Default quota
        quotaAvailable: 50,
        category: originalPackage.category,
        facilities: originalPackage.facilities,
        itinerary: originalPackage.itinerary,
        includes: originalPackage.includes,
        excludes: originalPackage.excludes,
        priceOptions: originalPackage.priceOptions,
        isActive: false, // Inactive by default
        views: 0,
        bookingClicks: 0,
        travelId: travelId
      }
    })

    // Increment packageUsed counter
    await prisma.travel.update({
      where: { id: travelId },
      data: { packageUsed: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: duplicatedPackage,
      message: 'Package duplicated successfully'
    })
  } catch (error) {
    console.error('Duplicate package error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate package' },
      { status: 500 }
    )
  }
}
