const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testAPIWithSortBy() {
  try {
    console.log('=== SIMULATING API CALL: /api/packages?sortBy=tercepat ===\n')
    
    // Simulate exact API logic
    const sortBy = 'tercepat'
    const includeInactive = false
    
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
            id: true,
            name: true,
            username: true,
            isVerified: true,
            isActive: true
          }
        }
      },
      take: 50
    })
    
    console.log('Total packages fetched:', packages.length)
    
    // Add favorite count
    const packagesWithFavorites = packages.map(pkg => ({
      ...pkg,
      favoriteCount: 0
    }))
    
    // Apply sorting based on sortBy parameter
    let sortedPackages
    if (sortBy && ['termurah', 'termahal', 'tercepat'].includes(sortBy)) {
      console.log('Using custom sortBy:', sortBy)
      sortedPackages = [...packagesWithFavorites].sort((a, b) => {
        // Priority 1: Pinned packages first
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        if (a.isPinned && b.isPinned) {
          const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
          const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
          return aTime - bTime
        }
        
        // Priority 2: Apply custom sort
        if (sortBy === 'termurah') {
          return a.price - b.price
        } else if (sortBy === 'termahal') {
          return b.price - a.price
        } else if (sortBy === 'tercepat') {
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
        }
        return 0
      })
    } else {
      console.log('Using default sorting')
      sortedPackages = packagesWithFavorites
    }
    
    console.log('\n=== TOP 10 RESULTS ===')
    sortedPackages.slice(0, 10).forEach((p, i) => {
      const date = new Date(p.departureDate)
      const pin = p.isPinned ? '📌' : '  '
      const isPalingCepat = p.name.toLowerCase().includes('paling cepat')
      const marker = isPalingCepat ? '🎯' : ''
      
      console.log(`${pin}${marker} ${i+1}. ${p.name}`)
      console.log(`     ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - Rp ${p.price.toLocaleString()}`)
      console.log(`     Travel: ${p.travel.username}`)
    })
    
    // Find position of "Paling Cepat"
    const palingCepatIndex = sortedPackages.findIndex(p => p.name.toLowerCase().includes('paling cepat'))
    if (palingCepatIndex >= 0) {
      console.log(`\n=== PAKET "PALING CEPAT" ===`)
      console.log(`Position: ${palingCepatIndex + 1} of ${sortedPackages.length}`)
      console.log(`Name: ${sortedPackages[palingCepatIndex].name}`)
      console.log(`Date: ${new Date(sortedPackages[palingCepatIndex].departureDate).toLocaleDateString('id-ID')}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testAPIWithSortBy()
