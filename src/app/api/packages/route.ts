import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple array for testing
const testPackages = [
  {
    id: '1',
    name: 'Umroh Premium Ramadhan 2025',
    description: 'Paket umroh premium dengan fasilitas bintang 5',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    price: 32000000,
    originalPrice: 37000000,
    duration: '12 Hari',
    departureCity: 'Jakarta',
    departureDate: '2025-11-25',
    quota: 45,
    quotaAvailable: 8,
    cashback: 2500000,
    category: 'premium',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '1',
    travel: {
      id: '1',
      name: 'Al-Hijrah Tour',
      rating: 4.8
    },
    priceOptions: [
      {
        name: 'Paket Silver',
        price: 32000000,
        originalPrice: 37000000,
        cashback: 1500000,
        hotelMakkah: 'Hotel Bintang 4 (500m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 4 (400m dari Masjid Nabawi)'
      },
      {
        name: 'Paket Gold',
        price: 38000000,
        originalPrice: 43000000,
        cashback: 2000000,
        hotelMakkah: 'Hotel Bintang 5 (300m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 5 (200m dari Masjid Nabawi)'
      },
      {
        name: 'Paket Platinum',
        price: 45000000,
        originalPrice: 52000000,
        cashback: 2500000,
        hotelMakkah: 'Hotel Bintang 5 (100m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 5 (50m dari Masjid Nabawi)'
      }
    ]
  },
  {
    id: '2',
    name: 'Umroh Reguler Ekonomis',
    description: 'Paket umroh hemat dengan fasilitas lengkap',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    price: 20000000,
    originalPrice: 23000000,
    duration: '9 Hari',
    departureCity: 'Surabaya',
    departureDate: '2025-12-20',
    quota: 40,
    quotaAvailable: 15,
    cashback: 1500000,
    category: 'reguler',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '2',
    travel: {
      id: '2',
      name: 'Berkah Umroh',
      rating: 4.5
    },
    priceOptions: [
      {
        name: 'Paket Hemat',
        price: 20000000,
        originalPrice: 23000000,
        cashback: 800000,
        hotelMakkah: 'Hotel Bintang 3 (800m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 3 (600m dari Masjid Nabawi)'
      },
      {
        name: 'Paket Standar',
        price: 25000000,
        originalPrice: 28000000,
        cashback: 1500000,
        hotelMakkah: 'Hotel Bintang 4 (500m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 4 (400m dari Masjid Nabawi)'
      }
    ]
  },
  {
    id: '3',
    name: 'Umroh Keluarga Plus Turki',
    description: 'Paket umroh keluarga dengan bonus tour Turki',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80',
    price: 45000000,
    duration: '16 Hari',
    departureCity: 'Bandung',
    departureDate: '2025-04-10',
    quota: 30,
    quotaAvailable: 12,
    category: 'keluarga',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '3',
    travel: {
      id: '3',
      name: 'Safar Wisata',
      rating: 4.7
    }
  },
  {
    id: '4',
    name: 'Umroh Hemat Backpacker',
    description: 'Paket umroh super hemat untuk backpacker',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    price: 18000000,
    duration: '7 Hari',
    departureCity: 'Jakarta',
    departureDate: '2025-01-25',
    quota: 50,
    quotaAvailable: 25,
    category: 'hemat',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '4',
    travel: {
      id: '4',
      name: 'Murah Meriah Travel',
      rating: 4.3
    }
  },
  {
    id: '5',
    name: 'Umroh VIP Exclusive',
    description: 'Paket umroh VIP dengan layanan eksklusif',
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800&q=80',
    price: 50000000,
    originalPrice: 58000000,
    duration: '14 Hari',
    departureCity: 'Jakarta',
    departureDate: '2025-05-01',
    quota: 20,
    quotaAvailable: 5,
    cashback: 3500000,
    category: 'premium',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '1',
    travel: {
      id: '1',
      name: 'Al-Hijrah Tour',
      rating: 4.8
    },
    priceOptions: [
      {
        name: 'Paket VIP',
        price: 50000000,
        originalPrice: 58000000,
        cashback: 2000000,
        hotelMakkah: 'Hotel Bintang 5 (50m dari Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 5 (30m dari Masjid Nabawi)'
      },
      {
        name: 'Paket VVIP',
        price: 65000000,
        originalPrice: 75000000,
        cashback: 3500000,
        hotelMakkah: 'Hotel Bintang 5 Mewah (Depan Masjidil Haram)',
        hotelMadinah: 'Hotel Bintang 5 Mewah (Depan Masjid Nabawi)'
      }
    ]
  },
  {
    id: '6',
    name: 'Umroh Plus Dubai',
    description: 'Paket umroh dengan bonus tour Dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    price: 38000000,
    duration: '13 Hari',
    departureCity: 'Medan',
    departureDate: '2025-03-05',
    quota: 35,
    quotaAvailable: 18,
    category: 'premium',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '5',
    travel: {
      id: '5',
      name: 'Nusantara Haji',
      rating: 4.6
    }
  },
  {
    id: '7',
    name: 'Umroh Reguler Nyaman',
    description: 'Paket umroh reguler dengan kenyamanan maksimal',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    price: 25000000,
    duration: '10 Hari',
    departureCity: 'Yogyakarta',
    departureDate: '2025-02-15',
    quota: 40,
    quotaAvailable: 22,
    category: 'reguler',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '2',
    travel: {
      id: '2',
      name: 'Berkah Umroh',
      rating: 4.5
    }
  },
  {
    id: '8',
    name: 'Umroh Keluarga Comfort',
    description: 'Paket umroh keluarga dengan fasilitas nyaman',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    price: 32000000,
    duration: '11 Hari',
    departureCity: 'Semarang',
    departureDate: '2025-04-20',
    quota: 30,
    quotaAvailable: 10,
    category: 'keluarga',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelId: '3',
    travel: {
      id: '3',
      name: 'Safar Wisata',
      rating: 4.7
    }
  }
]

export async function GET(request: Request) {
  console.log('=== GET Request ===')
  console.log('URL:', request.url)
  
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = searchParams.get('limit')
  const search = searchParams.get('search')
  const location = searchParams.get('location')
  const username = searchParams.get('username')
  const slug = searchParams.get('slug')
  const includeInactive = searchParams.get('includeInactive') === 'true'
  const period = searchParams.get('period')
  const simpleSort = searchParams.get('simpleSort') === 'true'
  
  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const skip = (page - 1) * pageSize
  const take = limit ? parseInt(limit) : pageSize

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

  console.log('Query params:', { category, limit, search, location, username, slug, includeInactive, period, page, pageSize })

  try {
    // If username is provided, find travel by username first
    let travelId: string | undefined
    if (username) {
      console.log('🔍 Finding travel by username:', username)
      const travel = await db.travel.findUnique({
        where: { username },
        select: { id: true, name: true }
      })
      travelId = travel?.id
      console.log('📍 Found travel:', travel?.name, 'ID:', travelId)
      
      if (!travelId) {
        console.log('⚠️ Travel not found for username:', username)
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Travel not found'
        })
      }
    }

    // Count total packages for pagination
    const totalCount = await db.package.count({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(travelId ? { travelId } : {}),
        ...(slug ? { slug } : {}),
        ...(category && category !== 'all' ? { category } : {}),
        ...(location && location !== 'all' ? { departureCity: { contains: location } } : {}),
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { departureCity: { contains: search } },
            { description: { contains: search } }
          ]
        } : {})
      }
    })

    // Fetch from database with pagination
    const packages = await db.package.findMany({
      where: {
        // Only filter by isActive if includeInactive is false (default behavior for public pages)
        ...(includeInactive ? {} : { isActive: true }),
        // Only show packages from active travels (for public pages)
        ...(includeInactive ? {} : { 
          travel: {
            isActive: true
          }
        }),
        ...(travelId ? { travelId } : {}),
        ...(slug ? { slug } : {}),
        ...(category && category !== 'all' ? { category } : {}),
        ...(location && location !== 'all' ? { departureCity: { contains: location } } : {}),
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { departureCity: { contains: search } },
            { description: { contains: search } },
            { travel: { username: { contains: search } } },
            { travel: { name: { contains: search } } }
          ]
        } : {})
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            rating: true,
            logo: true,
            username: true,
            isVerified: true,
            isActive: true,
            phone: true
          }
        }
      },
      // Don't use orderBy here - let the algorithm sort it
      skip: slug ? 0 : skip, // Don't skip if querying by slug
      take: slug ? 1 : take  // Only take 1 if querying by slug
    })

    // Get favorite counts for all packages (before sorting for popularity algorithm)
    const packageIds = packages.map(pkg => pkg.id)
    const favoriteCounts = await db.favorite.groupBy({
      by: ['packageId'],
      where: {
        packageId: {
          in: packageIds
        }
      },
      _count: {
        packageId: true
      }
    })

    // Create a map of packageId -> favorite count
    const favoriteCountMap = new Map(
      favoriteCounts.map(fc => [fc.packageId, fc._count.packageId])
    )

    // Add favorite count to packages before sorting
    const packagesWithFavorites = packages.map(pkg => ({
      ...pkg,
      favoriteCount: favoriteCountMap.get(pkg.id) || 0
    }))

    // Simple sort for admintrip dashboard (bypass all priorities)
    let sortedPackages
    if (simpleSort) {
      // Just sort by createdAt DESC (newest first)
      sortedPackages = [...packagesWithFavorites].sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else {
      // Fetch sorting settings from database
      const [algoSetting, prioritySetting] = await Promise.all([
        db.settings.findUnique({ where: { key: 'packageSortAlgorithm' } }),
        db.settings.findUnique({ where: { key: 'verifiedPriority' } })
      ])

      const algorithm = algoSetting?.value || 'newest'
      const verifiedPriority = prioritySetting?.value !== 'false'

      // Helper function to calculate popularity score
      const getPopularityScore = (pkg: any) => {
        return (pkg.views || 0) + 
               (pkg.favoriteCount || 0) * 2 + 
               (pkg.bookingClicks || 0) * 3
      }

      // Helper function for random with daily seed
      const getRandomWithSeed = () => {
        const today = new Date().toISOString().split('T')[0]
        const seed = today.split('-').reduce((a, b) => parseInt(a.toString()) + parseInt(b), 0)
        return seed
      }

      // Sort packages with priority order: Pin > Verified (if enabled) > Algorithm
      // Using single sort function to maintain priority order
      sortedPackages = [...packagesWithFavorites].sort((a: any, b: any) => {
        // Priority 1: Pinned packages always first (oldest pin first)
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        if (a.isPinned && b.isPinned) {
          const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
          const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
          return aTime - bTime
        }

        // Priority 2: Verified travel (if enabled)
        if (verifiedPriority) {
          if (a.travel.isVerified && !b.travel.isVerified) return -1
          if (!a.travel.isVerified && b.travel.isVerified) return 1
        }

        // Priority 3: Apply selected algorithm
        if (algorithm === 'popular') {
          return getPopularityScore(b) - getPopularityScore(a)
        } else if (algorithm === 'random') {
          const seed = getRandomWithSeed()
          return Math.sin(seed + a.id.charCodeAt(0)) - Math.sin(seed + b.id.charCodeAt(0))
        } else { // newest (default)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
    }

    // Apply limit after sorting (limit is already a number from take variable)
    const limitedPackages = sortedPackages

    // If querying by slug (detail view), increment views and log to tracking table
    if (slug && limitedPackages.length > 0) {
      const packageId = limitedPackages[0].id
      
      // Get IP address and user agent for tracking
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      // Increment views count and log the view
      await Promise.all([
        db.package.update({
          where: { id: packageId },
          data: {
            views: {
              increment: 1
            }
          }
        }),
        // @ts-ignore - PackageView model exists but TypeScript may not recognize it yet
        db.packageView.create({
          data: {
            packageId: packageId,
            ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
            userAgent: userAgent.substring(0, 255) // Limit length
          }
        })
      ])
    }

    // Parse JSON fields
    const packagesWithParsedData = limitedPackages.map(pkg => ({
      ...pkg,
      facilities: pkg.facilities ? JSON.parse(pkg.facilities) : [],
      includes: pkg.includes ? JSON.parse(pkg.includes) : [],
      excludes: pkg.excludes ? JSON.parse(pkg.excludes) : [],
      priceOptions: pkg.priceOptions ? JSON.parse(pkg.priceOptions) : [],
      itinerary: pkg.itinerary ? JSON.parse(pkg.itinerary) : []
    }))

    console.log('Filtered packages:', packagesWithParsedData.length)

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: packagesWithParsedData,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export async function POST(request: Request) {
  console.log('=== POST Request ===')
  console.log('URL:', request.url)
  
  try {
    const body = await request.json()
    console.log('POST body:', body)

    // Check package limit for this travel using packageUsed (permanent counter)
    if (body.travelId) {
      const travel = await db.travel.findUnique({
        where: { id: body.travelId },
        select: { 
          id: true, 
          name: true, 
          packageLimit: true,
          packageUsed: true,
          _count: {
            select: { packages: true }
          }
        }
      })

      if (travel) {
        const packageUsed = travel.packageUsed || 0
        const limit = travel.packageLimit || 10
        const activePackages = travel._count.packages

        console.log(`📦 Package quota check for ${travel.name}:`, {
          packageUsed: packageUsed,
          limit: limit,
          activePackages: activePackages,
          canAdd: limit === 999 || packageUsed < limit
        })

        // Check if quota used reached limit (999 means unlimited)
        if (limit !== 999 && packageUsed >= limit) {
          return NextResponse.json({
            success: false,
            error: `Kuota paket telah habis (${packageUsed}/${limit}). Hubungi admin untuk reset kuota atau upgrade limit.`,
            limitReached: true,
            packageUsed: packageUsed,
            limit: limit
          }, { status: 403 })
        }
      }
    }

    // Calculate lowest price and highest cashback from priceOptions
    let price = body.price || 0
    let originalPrice = body.originalPrice
    let cashback = body.cashback || 0

    if (body.priceOptions && body.priceOptions.length > 0) {
      // Find lowest price
      const lowestPriceOption = body.priceOptions.reduce((min: any, option: any) => 
        option.price < min.price ? option : min
      )
      price = lowestPriceOption.price
      originalPrice = lowestPriceOption.originalPrice

      // Find highest cashback
      const highestCashback = Math.max(...body.priceOptions.map((opt: any) => opt.cashback || 0))
      cashback = highestCashback
    }

    // Generate slug from package name
    let slug = generateSlug(body.name)
    
    // Check if slug already exists and make it unique
    let slugExists = await db.package.findFirst({ where: { slug } })
    let counter = 2
    while (slugExists) {
      slug = `${generateSlug(body.name)}-${counter}`
      slugExists = await db.package.findFirst({ where: { slug } })
      counter++
    }

    // Create package in database
    const newPackage = await db.package.create({
      data: {
        name: body.name,
        slug,
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
            logo: true,
            username: true
          }
        }
      }
    })

    console.log('New package created:', newPackage.id)

    // Increment packageUsed counter (permanent - never decreases)
    if (body.travelId) {
      await db.travel.update({
        where: { id: body.travelId },
        data: { packageUsed: { increment: 1 } }
      })
      
      console.log(`✅ Incremented packageUsed for travel ${body.travelId}`)
    }

    return NextResponse.json({
      success: true,
      data: newPackage,
      message: 'Package created successfully'
    })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}