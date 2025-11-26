const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkPinnedDetail() {
  console.log('🔍 Checking Pinned Package Detail...\n')

  try {
    const pinnedPackage = await db.package.findFirst({
      where: {
        isPinned: true
      },
      include: {
        travel: true
      }
    })

    if (!pinnedPackage) {
      console.log('❌ No pinned package found')
      return
    }

    console.log('📌 Pinned Package:')
    console.log(`   Name: ${pinnedPackage.name}`)
    console.log(`   ID: ${pinnedPackage.id}`)
    console.log(`   Slug: ${pinnedPackage.slug}`)
    console.log(`   isPinned: ${pinnedPackage.isPinned}`)
    console.log(`   pinnedAt: ${pinnedPackage.pinnedAt}`)
    console.log(`   isActive: ${pinnedPackage.isActive} ${pinnedPackage.isActive ? '✅' : '❌'}`)
    console.log()
    console.log('🏢 Travel Info:')
    console.log(`   Name: ${pinnedPackage.travel.name}`)
    console.log(`   Username: ${pinnedPackage.travel.username}`)
    console.log(`   isActive: ${pinnedPackage.travel.isActive} ${pinnedPackage.travel.isActive ? '✅' : '❌'}`)
    console.log(`   isVerified: ${pinnedPackage.travel.isVerified}`)
    console.log()

    // Check if it would pass filters
    console.log('🔍 Filter Check:')
    if (!pinnedPackage.isActive) {
      console.log('   ❌ Package is NOT active - will be filtered out!')
    } else {
      console.log('   ✅ Package is active')
    }

    if (!pinnedPackage.travel.isActive) {
      console.log('   ❌ Travel is NOT active - will be filtered out!')
    } else {
      console.log('   ✅ Travel is active')
    }

    console.log()
    console.log('💡 Solution:')
    if (!pinnedPackage.isActive || !pinnedPackage.travel.isActive) {
      console.log('   Activate the package and/or travel to make it appear on homepage')
    } else {
      console.log('   Package should appear on homepage - check API filters')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkPinnedDetail()
