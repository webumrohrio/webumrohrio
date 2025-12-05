const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testAPIFull() {
  try {
    console.log('=== SIMULATING: /api/packages?includeInactive=true ===\n')
    
    // Simulate the exact API logic
    const includeInactive = true
    const page = 1
    const pageSize = 20
    const skip = (page - 1) * pageSize
    const take = pageSize
    
    // Fetch packages (same as API)
    const packages = await db.package.findMany({
      where: includeInactive ? {} : { 
        isActive: true,
        travel: {
          isActive: true
        }
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
      skip: skip,
      take: take
    })
    
    // Get favorite counts
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
    
    const favoriteCountMap = new Map(
      favoriteCounts.map(fc => [fc.packageId, fc._count.packageId])
    )
    
    const packagesWithFavorites = packages.map(pkg => ({
      ...pkg,
      favoriteCount: favoriteCountMap.get(pkg.id) || 0
    }))
    
    // Get sorting settings
    const algoSetting = await db.settings.findUnique({ where: { key: 'packageSortAlgorithm' } })
    const prioritySetting = await db.settings.findUnique({ where: { key: 'verifiedPriority' } })
    
    const algorithm = algoSetting?.value || 'newest'
    const verifiedPriority = prioritySetting?.value !== 'false'
    
    console.log('Sorting Algorithm:', algorithm)
    console.log('Verified Priority:', verifiedPriority)
    console.log('Page:', page)
    console.log('Page Size:', pageSize)
    console.log('Skip:', skip)
    console.log('Take:', take)
    console.log('\nTotal packages fetched:', packages.length)
    
    // Sort packages
    const getPopularityScore = (pkg) => {
      return (pkg.views || 0) + 
             (pkg.favoriteCount || 0) * 2 + 
             (pkg.bookingClicks || 0) * 3
    }
    
    const sortedPackages = [...packagesWithFavorites].sort((a, b) => {
      // Priority 1: Pinned packages
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (a.isPinned && b.isPinned) {
        const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
        const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
        return aTime - bTime
      }
      
      // Priority 2: Verified travel
      if (verifiedPriority) {
        if (a.travel.isVerified && !b.travel.isVerified) return -1
        if (!a.travel.isVerified && b.travel.isVerified) return 1
      }
      
      // Priority 3: Algorithm
      if (algorithm === 'popular') {
        return getPopularityScore(b) - getPopularityScore(a)
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    console.log('\n=== SORTED PACKAGES (Top 20) ===')
    sortedPackages.forEach((pkg, index) => {
      const isDNT = pkg.travel.username === 'dnt'
      const isHotelDekat = pkg.name.includes('Hotel Dekat')
      const marker = isHotelDekat ? '🎯' : (isDNT ? '📦' : '  ')
      console.log(`${marker} ${index + 1}. ${pkg.name} (${pkg.travel.username}) - Created: ${new Date(pkg.createdAt).toISOString().split('T')[0]}`)
    })
    
    const hotelDekatIndex = sortedPackages.findIndex(p => p.name.includes('Hotel Dekat'))
    console.log('\n=== RESULT ===')
    if (hotelDekatIndex >= 0) {
      console.log(`✓ "Hotel Dekat" FOUND at position ${hotelDekatIndex + 1}`)
    } else {
      console.log('✗ "Hotel Dekat" NOT FOUND in first 20 packages')
      console.log('\nLet\'s check if it exists beyond page 1...')
      
      // Check all packages
      const allPackages = await db.package.findMany({
        where: includeInactive ? {} : { 
          isActive: true,
          travel: {
            isActive: true
          }
        },
        include: {
          travel: {
            select: {
              id: true,
              name: true,
              username: true,
              isVerified: true,
              isActive: true
            }
          }
        }
      })
      
      const hotelDekatInAll = allPackages.find(p => p.name.includes('Hotel Dekat'))
      if (hotelDekatInAll) {
        console.log(`\n✓ "Hotel Dekat" EXISTS in database (Total packages: ${allPackages.length})`)
        console.log(`  - Created: ${hotelDekatInAll.createdAt}`)
        console.log(`  - Travel: ${hotelDekatInAll.travel.username}`)
        console.log(`  - Is Pinned: ${hotelDekatInAll.isPinned}`)
        console.log(`  - Travel Verified: ${hotelDekatInAll.travel.isVerified}`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testAPIFull()
