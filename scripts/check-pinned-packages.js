const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkPinned() {
  try {
    const pinned = await db.package.findMany({
      where: {
        isPinned: true,
        isActive: true
      },
      select: {
        name: true,
        price: true,
        pinnedAt: true,
        travel: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        pinnedAt: 'asc'
      }
    })
    
    console.log('=== PINNED PACKAGES ===')
    console.log('Total:', pinned.length)
    pinned.forEach((p, i) => {
      console.log(`📌 ${i+1}. ${p.name} - Rp ${p.price.toLocaleString()} (${p.travel.username})`)
      console.log(`   Pinned at: ${p.pinnedAt}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkPinned()
