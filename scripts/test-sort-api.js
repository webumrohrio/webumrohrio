const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testSort() {
  try {
    console.log('=== SIMULATING API CALL: sortBy=termahal ===\n')
    
    // Fetch packages
    const packages = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        }
      },
      include: {
        travel: {
          select: {
            username: true,
            name: true,
            isVerified: true
          }
        }
      },
      take: 50
    })
    
    console.log('Total packages fetched:', packages.length)
    
    // Add favorite count (simplified - just set to 0)
    const packagesWithFavorites = packages.map(pkg => ({
      ...pkg,
      favoriteCount: 0
    }))
    
    // Sort by termahal (price DESC)
    const sortedPackages = [...packagesWithFavorites].sort((a, b) => {
      // Priority 1: Pinned packages first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (a.isPinned && b.isPinned) {
        const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
        const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
        return aTime - bTime
      }
      
      // Priority 2: Sort by price DESC (termahal)
      return b.price - a.price
    })
    
    console.log('\n=== TOP 10 SORTED BY TERMAHAL ===')
    sortedPackages.slice(0, 10).forEach((p, i) => {
      const pin = p.isPinned ? '📌' : '  '
      const hotelDekat = p.name.includes('Hotel Dekat') ? '🎯' : ''
      console.log(`${pin}${hotelDekat} ${i+1}. ${p.name}`)
      console.log(`     Rp ${p.price.toLocaleString()} (${p.travel.username})`)
    })
    
    // Find Hotel Dekat position
    const hotelDekatIndex = sortedPackages.findIndex(p => p.name.includes('Hotel Dekat'))
    console.log(`\n=== HOTEL DEKAT POSITION ===`)
    console.log(`Position: ${hotelDekatIndex + 1} of ${sortedPackages.length}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testSort()
