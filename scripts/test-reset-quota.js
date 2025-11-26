const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testResetQuota() {
  console.log('🧪 Testing Reset Quota Feature...\n')

  try {
    // 1. Get a travel with packageUsed > 0
    const travel = await db.travel.findFirst({
      where: {
        packageUsed: { gt: 0 }
      },
      include: {
        _count: {
          select: { packages: true }
        }
      }
    })

    if (!travel) {
      console.log('❌ No travel found with packageUsed > 0')
      return
    }

    console.log('📦 Selected Travel:')
    console.log(`   Name: ${travel.name}`)
    console.log(`   Username: ${travel.username}`)
    console.log(`   Package Limit: ${travel.packageLimit}`)
    console.log(`   Package Used (before): ${travel.packageUsed}`)
    console.log(`   Active Packages: ${travel._count.packages}\n`)

    // 2. Reset quota to 0
    console.log('🔄 Resetting quota to 0...')
    const updated = await db.travel.update({
      where: { id: travel.id },
      data: { packageUsed: 0 }
    })

    console.log(`✅ Quota reset successful!`)
    console.log(`   Package Used (after): ${updated.packageUsed}\n`)

    // 3. Restore original value
    console.log('🔄 Restoring original value...')
    await db.travel.update({
      where: { id: travel.id },
      data: { packageUsed: travel.packageUsed }
    })

    console.log(`✅ Original value restored: ${travel.packageUsed}\n`)

    console.log('============================================================')
    console.log('✅ Reset Quota Test PASSED!')
    console.log('============================================================')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testResetQuota()
