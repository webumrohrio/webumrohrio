const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkPrice() {
  try {
    const pkg = await db.package.findFirst({
      where: {
        name: { contains: 'Hotel Dekat', mode: 'insensitive' }
      },
      select: {
        name: true,
        price: true,
        isPinned: true,
        pinnedAt: true,
        travel: {
          select: {
            username: true
          }
        }
      }
    })
    
    console.log('=== PAKET HOTEL DEKAT ===')
    console.log(JSON.stringify(pkg, null, 2))
    
    // Get all packages sorted by price DESC
    const allPackages = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        }
      },
      select: {
        name: true,
        price: true,
        isPinned: true,
        travel: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      },
      take: 10
    })
    
    console.log('\n=== TOP 10 TERMAHAL ===')
    allPackages.forEach((p, i) => {
      const pin = p.isPinned ? '📌' : '  '
      console.log(`${pin} ${i + 1}. ${p.name} - Rp ${p.price.toLocaleString()} (${p.travel.username})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkPrice()
