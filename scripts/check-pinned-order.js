const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPinnedOrder() {
  try {
    console.log('🔍 Checking all packages with pin status...\n')
    
    // Get all packages with sorting logic from API
    const packages = await prisma.package.findMany({
      where: {
        isActive: true
      },
      include: {
        travel: {
          select: {
            name: true,
            isVerified: true
          }
        }
      },
      take: 20
    })

    // Sort with same logic as API
    const sortedPackages = [...packages].sort((a, b) => {
      // Priority 1: Pinned packages always first (oldest pin first)
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (a.isPinned && b.isPinned) {
        const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
        const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
        return aTime - bTime
      }

      // Priority 2: Verified travel
      if (a.travel.isVerified && !b.travel.isVerified) return -1
      if (!a.travel.isVerified && b.travel.isVerified) return 1

      // Priority 3: Newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    console.log('📦 Top 20 packages in order:\n')
    sortedPackages.forEach((pkg, index) => {
      const pinStatus = pkg.isPinned ? '📌 PINNED' : '  '
      const verifiedStatus = pkg.travel.isVerified ? '✓' : ' '
      const pinnedAt = pkg.isPinned && pkg.pinnedAt ? ` (${pkg.pinnedAt.toISOString()})` : ''
      
      console.log(`${index + 1}. ${pinStatus} [${verifiedStatus}] ${pkg.name} - ${pkg.travel.name}${pinnedAt}`)
    })

    // Count pinned packages
    const pinnedCount = sortedPackages.filter(p => p.isPinned).length
    console.log(`\n📊 Total pinned packages: ${pinnedCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPinnedOrder()
