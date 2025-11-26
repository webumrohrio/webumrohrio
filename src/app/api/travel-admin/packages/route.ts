import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get travel ID from request body (sent from client)
    const body = await request.json()
    const travelId = body.travelId
    
    if (!travelId) {
      return NextResponse.json({ error: 'Travel ID required' }, { status: 401 })
    }

    // Get travel info
    const travel = await prisma.travel.findUnique({
      where: { id: travelId }
    })

    if (!travel) {
      return NextResponse.json({ error: 'Travel not found' }, { status: 404 })
    }

    // Extract package data from body
    const {
      name,
      description,
      image,
      price,
      cashback,
      isBestSeller,
      departureDate,
      returnDate,
      departureCity,
      duration,
      flightType,
      quota,
      quotaAvailable,
      priceOptions,
      facilities,
      itinerary,
      includes,
      excludes,
      isActive = true
    } = body

    // Validate required fields
    if (!name || !price || !departureDate || !departureCity || !quota) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    let slug = baseSlug
    let counter = 1
    
    // Check if slug exists and make it unique
    while (true) {
      const existingPackage = await prisma.package.findUnique({
        where: { slug }
      })
      if (!existingPackage) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create package and increment packageUsed
    const newPackage = await prisma.package.create({
      data: {
        name,
        slug,
        description,
        image,
        price: parseFloat(price),
        cashback: cashback ? parseFloat(cashback) : 0,
        isBestSeller: isBestSeller || false,
        departureDate: new Date(departureDate),
        returnDate: returnDate ? new Date(returnDate) : null,
        departureCity,
        duration: duration || '12 Hari',
        flightType: flightType || 'langsung',
        quota: parseInt(quota),
        quotaAvailable: quotaAvailable ? parseInt(quotaAvailable) : parseInt(quota),
        priceOptions: JSON.stringify(priceOptions || []),
        facilities: JSON.stringify(facilities || []),
        itinerary: JSON.stringify(itinerary || []),
        includes: JSON.stringify(includes || []),
        excludes: JSON.stringify(excludes || []),
        isActive,
        travelId: travel.id,
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
          }
        }
      }
    })

    // Increment packageUsed for the travel (permanent counter)
    await prisma.travel.update({
      where: { id: travel.id },
      data: {
        packageUsed: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      package: newPackage
    })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
