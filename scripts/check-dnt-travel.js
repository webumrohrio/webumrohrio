const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkDNTTravel() {
  try {
    // Check DNT travel status
    const travel = await db.travel.findUnique({
      where: { username: 'dnt' },
      select: {
        id: true,
        name: true,
        username: true,
        isActive: true
      }
    })
    
    console.log('=== TRAVEL DNT STATUS ===')
    console.log(JSON.stringify(travel, null, 2))
    
    // Check packages with "Hotel Dekat" in name
    const packages = await db.package.findMany({
      where: {
        travel: { username: 'dnt' },
        name: { contains: 'Hotel Dekat' }
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        travel: {
          select: {
            username: true,
            name: true,
            isActive: true
          }
        }
      }
    })
    
    console.log('\n=== PACKAGES WITH "Hotel Dekat" ===')
    console.log(JSON.stringify(packages, null, 2))
    
    // Check all DNT packages count
    const allDNTPackages = await db.package.count({
      where: {
        travel: { username: 'dnt' }
      }
    })
    
    console.log('\n=== TOTAL DNT PACKAGES ===')
    console.log('Total:', allDNTPackages)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDNTTravel()
