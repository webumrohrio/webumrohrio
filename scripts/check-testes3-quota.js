const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkTestes3Quota() {
  console.log('🔍 Checking testes3 travel quota...\n')

  try {
    const travel = await db.travel.findUnique({
      where: { username: 'testes3' },
      include: {
        _count: {
          select: { packages: true }
        }
      }
    })

    if (!travel) {
      console.log('❌ Travel not found')
      return
    }

    console.log('📦 Travel Info:')
    console.log(`   Name: ${travel.name}`)
    console.log(`   Username: ${travel.username}`)
    console.log(`   Package Limit: ${travel.packageLimit}`)
    console.log(`   Package Used: ${travel.packageUsed}`)
    console.log(`   Active Packages: ${travel._count.packages}`)
    console.log()

    if (travel.packageUsed !== travel._count.packages) {
      console.log('⚠️  MISMATCH DETECTED!')
      console.log(`   packageUsed (${travel.packageUsed}) should be ${travel._count.packages}`)
      console.log()
      console.log('🔧 Fixing...')
      
      await db.travel.update({
        where: { id: travel.id },
        data: { packageUsed: travel._count.packages }
      })
      
      console.log('✅ Fixed! packageUsed updated to:', travel._count.packages)
    } else {
      console.log('✅ Quota is correct!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkTestes3Quota()
