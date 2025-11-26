/**
 * Script to fix packageUsed counter for all travels
 * This sets packageUsed to the current count of packages
 * Run this once after implementing the permanent counter system
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPackageUsedCounter() {
  try {
    console.log('🔧 Fixing packageUsed counter for all travels...\n')

    // Get all travels
    const travels = await prisma.travel.findMany({
      include: {
        _count: {
          select: { packages: true }
        }
      }
    })

    console.log(`Found ${travels.length} travels\n`)

    for (const travel of travels) {
      const currentPackageCount = travel._count.packages
      
      // Update packageUsed to current package count
      await prisma.travel.update({
        where: { id: travel.id },
        data: {
          packageUsed: currentPackageCount
        }
      })

      console.log(`✅ ${travel.name} (${travel.username})`)
      console.log(`   packageUsed set to: ${currentPackageCount}`)
      console.log(`   packageLimit: ${travel.packageLimit}\n`)
    }

    console.log('✨ All done! packageUsed counters have been fixed.')
    console.log('\n📝 Note: From now on:')
    console.log('   - Creating a package will INCREMENT packageUsed')
    console.log('   - Deleting a package will NOT DECREMENT packageUsed')
    console.log('   - This ensures permanent tracking of package usage\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPackageUsedCounter()
