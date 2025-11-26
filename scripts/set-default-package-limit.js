/**
 * Script to set default packageLimit for existing travels
 * Run this after migration to ensure all travels have packageLimit set
 * 
 * Usage:
 * node scripts/set-default-package-limit.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setDefaultPackageLimit() {
  console.log('🚀 Starting to set default package limits...\n')

  try {
    // Get all travels
    const travels = await prisma.travel.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        packageLimit: true,
        _count: {
          select: { packages: true }
        }
      }
    })

    console.log(`📊 Found ${travels.length} travel(s)\n`)

    // Update travels that don't have packageLimit set (or have default 10)
    let updated = 0
    
    for (const travel of travels) {
      const currentPackages = travel._count.packages
      
      console.log(`\n📦 ${travel.name} (${travel.username})`)
      console.log(`   Current Limit: ${travel.packageLimit}`)
      console.log(`   Current Packages: ${currentPackages}`)
      
      // Determine appropriate limit based on current packages
      let newLimit = travel.packageLimit
      
      // If travel already has more packages than default limit, upgrade them
      if (currentPackages > travel.packageLimit) {
        if (currentPackages <= 6) newLimit = 6
        else if (currentPackages <= 10) newLimit = 10
        else if (currentPackages <= 15) newLimit = 15
        else if (currentPackages <= 20) newLimit = 20
        else newLimit = 999 // Unlimited for travels with many packages
        
        console.log(`   ⚠️  Has ${currentPackages} packages but limit is ${travel.packageLimit}`)
        console.log(`   ✅ Upgrading to: ${newLimit === 999 ? 'Unlimited' : newLimit}`)
        
        await prisma.travel.update({
          where: { id: travel.id },
          data: { packageLimit: newLimit }
        })
        
        updated++
      } else {
        console.log(`   ✓ Limit OK (${travel.packageLimit} >= ${currentPackages})`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Process completed!`)
    console.log(`   Total travels: ${travels.length}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   No change needed: ${travels.length - updated}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
setDefaultPackageLimit()
