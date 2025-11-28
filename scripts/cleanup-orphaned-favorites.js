const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupOrphanedFavorites() {
  try {
    console.log('🔄 Cleaning up orphaned favorites...\n')
    
    // Get all favorites
    const favorites = await prisma.favorite.findMany()
    
    console.log(`Found ${favorites.length} total favorites`)
    
    let deletedCount = 0
    
    for (const fav of favorites) {
      // Check if package exists
      const pkg = await prisma.package.findUnique({
        where: { id: fav.packageId }
      })
      
      if (!pkg) {
        console.log(`❌ Deleting orphaned favorite: Package ID ${fav.packageId}`)
        await prisma.favorite.delete({
          where: { id: fav.id }
        })
        deletedCount++
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✅ Cleanup completed!`)
    console.log(`   Deleted: ${deletedCount} orphaned favorites`)
    console.log(`   Remaining: ${favorites.length - deletedCount} valid favorites`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOrphanedFavorites()
