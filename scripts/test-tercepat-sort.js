const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testTercepat() {
  try {
    console.log('=== TESTING TERCEPAT SORT ===\n')
    
    // Get all active packages
    const packages = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        }
      },
      select: {
        name: true,
        departureDate: true,
        isPinned: true,
        travel: {
          select: {
            username: true
          }
        }
      }
    })
    
    console.log('Total packages:', packages.length)
    
    // Sort by tercepat (departureDate ASC)
    const sorted = [...packages].sort((a, b) => {
      // Priority 1: Pinned first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Priority 2: Sort by departure date ASC
      return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
    })
    
    console.log('\n=== TOP 10 TERCEPAT ===')
    sorted.slice(0, 10).forEach((p, i) => {
      const date = new Date(p.departureDate)
      const pin = p.isPinned ? '📌' : '  '
      const isPalingCepat = p.name.toLowerCase().includes('paling cepat')
      const marker = isPalingCepat ? '🎯' : ''
      
      console.log(`${pin}${marker} ${i+1}. ${p.name}`)
      console.log(`     ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${p.travel.username})`)
    })
    
    // Check if there's a package with "paling cepat" in name
    const palingCepat = packages.find(p => p.name.toLowerCase().includes('paling cepat'))
    if (palingCepat) {
      const index = sorted.findIndex(p => p.name === palingCepat.name)
      console.log(`\n=== PAKET "PALING CEPAT" ===`)
      console.log(`Name: ${palingCepat.name}`)
      console.log(`Date: ${new Date(palingCepat.departureDate).toLocaleDateString('id-ID')}`)
      console.log(`Position: ${index + 1} of ${sorted.length}`)
    } else {
      console.log(`\n⚠️ No package with "paling cepat" in name found`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testTercepat()
