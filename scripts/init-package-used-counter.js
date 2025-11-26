/**
 * Initialize packageUsed counter for all travels
 * Sets packageUsed = current package count
 * 
 * Usage:
 * node scripts/init-package-used-counter.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function initPackageUsedCounter() {
  console.log('🚀 Initializing packageUsed counter...\n')

  try {
    // Get all travels with package count
    const travels = await prisma.travel.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        packageUsed: true,
        _count: {
          select: { packages: true }
        }
      }
    })

    console.log(`📊 Found ${travels.length} travel(s)\n`)

    let updated = 0
    
    for (const travel of travels) {
      const currentPackages = travel._count.packages
      
      console.log(`📦 ${travel.name} (${travel.username})`)
      console.log(`   Current packageUsed: ${travel.packageUsed}`)
      console.log(`   Current packages: ${currentPackages}`)
      
      // Set packageUsed = current package count
      await prisma.travel.update({
        where: { id: travel.id },
        data: { packageUsed: currentPackages }
      })
      
      console.log(`   ✅ Updated packageUsed to: ${currentPackages}\n`)
      updated++
    }

    console.log('='.repeat(60))
    console.log(`✅ Process completed!`)
    console.log(`   Total travels: ${travels.length}`)
    console.log(`   Updated: ${updated}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
initPackageUsedCounter()
