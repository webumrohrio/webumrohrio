const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function showAllQuota() {
  console.log('📊 KUOTA TERPAKAI - DATA DARI DATABASE\n')
  console.log('=' .repeat(80))

  try {
    const travels = await db.travel.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        packageLimit: true,
        packageUsed: true,  // ✅ Data dari database
        _count: {
          select: { packages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\nTotal Travels: ${travels.length}\n`)

    travels.forEach((travel, index) => {
      const percentage = travel.packageLimit === 999 
        ? 0 
        : Math.round((travel.packageUsed / travel.packageLimit) * 100)
      
      const status = travel.packageLimit === 999 
        ? '∞ Unlimited'
        : travel.packageUsed >= travel.packageLimit 
        ? '🔴 PENUH'
        : travel.packageUsed >= travel.packageLimit * 0.8
        ? '🟠 Hampir Penuh'
        : '🟢 Tersedia'

      console.log(`${index + 1}. ${travel.name}`)
      console.log(`   Username: ${travel.username}`)
      console.log(`   ID: ${travel.id}`)
      console.log(`   Package Limit: ${travel.packageLimit}`)
      console.log(`   Package Used: ${travel.packageUsed} ✅ (dari database)`)
      console.log(`   Active Packages: ${travel._count.packages}`)
      console.log(`   Usage: ${percentage}% ${status}`)
      console.log()
    })

    console.log('=' .repeat(80))
    console.log('\n✅ Semua data di atas diambil langsung dari database SQLite')
    console.log('📁 Database file: prisma/db/custom.db')
    console.log('📋 Table: Travel')
    console.log('🔢 Column: packageUsed (INTEGER)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

showAllQuota()
