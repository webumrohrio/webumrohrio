const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkPinnedPackages() {
  console.log('📌 Checking Pinned Packages...\n')

  try {
    const pinnedPackages = await db.package.findMany({
      where: {
        isPinned: true
      },
      include: {
        travel: {
          select: {
            name: true,
            username: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        pinnedAt: 'asc'
      }
    })

    console.log(`Total Pinned Packages: ${pinnedPackages.length}\n`)

    if (pinnedPackages.length === 0) {
      console.log('❌ No pinned packages found!')
      console.log('\nTo pin a package:')
      console.log('1. Go to /admintrip/packages')
      console.log('2. Click the pin icon (📌) on a package')
      console.log('3. Package will appear at the top of homepage')
    } else {
      pinnedPackages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.name}`)
        console.log(`   Travel: ${pkg.travel.name} ${pkg.travel.isVerified ? '✓' : ''}`)
        console.log(`   Pinned At: ${pkg.pinnedAt}`)
        console.log(`   Active: ${pkg.isActive ? 'Yes' : 'No'}`)
        console.log()
      })
    }

    // Check all packages count
    const totalPackages = await db.package.count()
    const activePackages = await db.package.count({ where: { isActive: true } })
    
    console.log('=' .repeat(60))
    console.log(`Total Packages: ${totalPackages}`)
    console.log(`Active Packages: ${activePackages}`)
    console.log(`Pinned Packages: ${pinnedPackages.length}`)
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkPinnedPackages()
