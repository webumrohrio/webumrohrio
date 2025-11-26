const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPinnedPackages() {
  try {
    console.log('🔍 Checking pinned packages without pinnedAt timestamp...')
    
    // Find all pinned packages without pinnedAt
    const pinnedPackages = await prisma.package.findMany({
      where: {
        isPinned: true,
        pinnedAt: null
      },
      select: {
        id: true,
        name: true,
        isPinned: true,
        pinnedAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // Oldest first
      }
    })

    console.log(`📦 Found ${pinnedPackages.length} pinned packages without pinnedAt`)

    if (pinnedPackages.length === 0) {
      console.log('✅ All pinned packages already have pinnedAt timestamp')
      return
    }

    // Update each package with pinnedAt based on createdAt
    for (const pkg of pinnedPackages) {
      await prisma.package.update({
        where: { id: pkg.id },
        data: {
          pinnedAt: pkg.createdAt // Use createdAt as pinnedAt for existing pins
        }
      })
      
      console.log(`✅ Updated: ${pkg.name} - pinnedAt set to ${pkg.createdAt.toISOString()}`)
    }

    console.log('\n🎉 All pinned packages have been updated with pinnedAt timestamp!')
    
    // Verify the fix
    console.log('\n🔍 Verifying pinned packages order...')
    const allPinned = await prisma.package.findMany({
      where: {
        isPinned: true
      },
      select: {
        id: true,
        name: true,
        isPinned: true,
        pinnedAt: true
      },
      orderBy: {
        pinnedAt: 'asc'
      }
    })

    console.log('\n📌 Pinned packages in order:')
    allPinned.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name} - Pinned at: ${pkg.pinnedAt?.toISOString() || 'NULL'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPinnedPackages()
