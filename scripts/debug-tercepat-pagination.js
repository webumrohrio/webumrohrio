const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugTercepatPagination() {
  console.log('=== Debug Tercepat Pagination ===\n')

  // Fetch all active packages
  const allPackages = await prisma.package.findMany({
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
          isVerified: true
        }
      }
    },
    take: 1000
  })

  console.log(`Total active packages: ${allPackages.length}\n`)

  // Sort by tercepat (earliest departure date)
  const sorted = [...allPackages].sort((a, b) => {
    // Pinned first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (a.isPinned && b.isPinned) {
      const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
      const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
      return aTime - bTime
    }

    // Then by departure date
    return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  })

  console.log('=== Sorted by Tercepat (first 25) ===')
  sorted.slice(0, 25).forEach((pkg, idx) => {
    console.log(`${idx + 1}. [${pkg.id}] ${pkg.name}`)
    console.log(`   Departure: ${pkg.departureDate.toISOString().split('T')[0]}`)
    console.log(`   Pinned: ${pkg.isPinned ? 'YES' : 'no'}`)
    console.log(`   Travel: ${pkg.travel.name}`)
    console.log('')
  })

  // Simulate pagination
  console.log('\n=== Pagination Simulation ===')
  
  const page1 = sorted.slice(0, 20)
  const page2 = sorted.slice(20, 40)
  
  console.log('\nPage 1 (0-19):')
  page1.forEach((pkg, idx) => {
    console.log(`  ${idx + 1}. [${pkg.id}] ${pkg.name.substring(0, 30)}`)
  })
  
  console.log('\nPage 2 (20-39):')
  page2.forEach((pkg, idx) => {
    console.log(`  ${idx + 21}. [${pkg.id}] ${pkg.name.substring(0, 30)}`)
  })

  // Check for duplicates
  const page1Ids = new Set(page1.map(p => p.id))
  const page2Ids = new Set(page2.map(p => p.id))
  const duplicates = [...page1Ids].filter(id => page2Ids.has(id))
  
  if (duplicates.length > 0) {
    console.log('\n⚠️  DUPLICATES FOUND:')
    duplicates.forEach(id => {
      const pkg = sorted.find(p => p.id === id)
      console.log(`  - [${id}] ${pkg.name}`)
    })
  } else {
    console.log('\n✅ No duplicates between page 1 and page 2')
  }

  // Check what would be filtered out by dedup
  console.log('\n=== Dedup Simulation ===')
  const existingIds = new Set(page1.map(p => p.id))
  const filteredPage2 = page2.filter(p => !existingIds.has(p.id))
  
  console.log(`Page 2 original count: ${page2.length}`)
  console.log(`Page 2 after dedup: ${filteredPage2.length}`)
  console.log(`Filtered out: ${page2.length - filteredPage2.length}`)
  
  if (page2.length !== filteredPage2.length) {
    console.log('\n⚠️  These packages were filtered out:')
    page2.filter(p => existingIds.has(p.id)).forEach(pkg => {
      console.log(`  - [${pkg.id}] ${pkg.name}`)
    })
  }

  await prisma.$disconnect()
}

debugTercepatPagination().catch(console.error)
