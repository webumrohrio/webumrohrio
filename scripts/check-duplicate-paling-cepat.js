const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkDuplicate() {
  try {
    const packages = await db.package.findMany({
      where: {
        name: { contains: 'Paling Cepat', mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        departureDate: true,
        departureCity: true,
        isActive: true,
        travel: {
          select: {
            username: true,
            isActive: true
          }
        }
      }
    })
    
    console.log('=== PACKAGES WITH "PALING CEPAT" ===')
    console.log('Total:', packages.length)
    packages.forEach((p, i) => {
      console.log(`\n${i+1}. ${p.name}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Date: ${new Date(p.departureDate).toLocaleDateString('id-ID')}`)
      console.log(`   City: ${p.departureCity}`)
      console.log(`   Active: ${p.isActive}`)
      console.log(`   Travel: ${p.travel.username} (Active: ${p.travel.isActive})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDuplicate()
