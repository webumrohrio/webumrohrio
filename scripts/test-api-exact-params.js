const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testExactParams() {
  try {
    console.log('=== SIMULATING: /api/packages?location=Pekanbaru&page=1&pageSize=20&sortBy=tercepat ===\n')
    
    // Exact same parameters
    const location = 'Pekanbaru'
    const page = 1
    const pageSize = 20
    const sortBy = 'tercepat'
    const skip = (page - 1) * pageSize
    
    // Fetch packages with location filter
    const packages = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        },
        departureCity: { contains: location, mode: 'insensitive' }
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
      skip: skip,
      take: pageSize
    })
    
    console.log('Total packages fetched:', packages.length)
    
    // Add favorite count
    const packagesWithFavorites = packages.map(pkg => ({
      ...pkg,
      favoriteCount: 0
    }))
    
    // Sort by tercepat
    const sortedPackages = [...packagesWithFavorites].sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Sort by departure date ASC
      return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
    })
    
    console.log('\n=== SORTED PACKAGES ===')
    sortedPackages.forEach((p, i) => {
      const date = new Date(p.departureDate)
      const isPalingCepat = p.name.toLowerCase().includes('paling cepat')
      const marker = isPalingCepat ? '🎯' : '  '
      console.log(`${marker} ${i+1}. ${p.name}`)
      console.log(`     ${date.toLocaleDateString('id-ID')} (${p.travel.username})`)
    })
    
    const palingCepatIndex = sortedPackages.findIndex(p => p.name.toLowerCase().includes('paling cepat'))
    console.log(`\n=== RESULT ===`)
    if (palingCepatIndex >= 0) {
      console.log(`✅ "Paling Cepat" found at position ${palingCepatIndex + 1}`)
    } else {
      console.log(`❌ "Paling Cepat" NOT FOUND in results`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testExactParams()
