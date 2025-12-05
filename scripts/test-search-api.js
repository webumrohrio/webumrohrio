const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testSearchAPI() {
  try {
    console.log('=== TEST SEARCH API LOGIC ===\n')
    
    const search = 'umroh'
    
    // Simulate API search query
    const packages = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { departureCity: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { travel: { username: { contains: search, mode: 'insensitive' } } },
          { travel: { name: { contains: search, mode: 'insensitive' } } }
        ]
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            username: true,
            isActive: true
          }
        }
      },
      take: 10
    })
    
    console.log(`Search query: "${search}"`)
    console.log(`Results found: ${packages.length}`)
    console.log('\nFirst 5 results:')
    packages.slice(0, 5).forEach((pkg, i) => {
      console.log(`${i + 1}. ${pkg.name} (${pkg.travel.username})`)
    })
    
    // Test with "hotel dekat"
    console.log('\n\n=== TEST "hotel dekat" ===\n')
    const search2 = 'hotel dekat'
    
    const packages2 = await db.package.findMany({
      where: {
        isActive: true,
        travel: {
          isActive: true
        },
        OR: [
          { name: { contains: search2, mode: 'insensitive' } },
          { departureCity: { contains: search2, mode: 'insensitive' } },
          { description: { contains: search2, mode: 'insensitive' } },
          { travel: { username: { contains: search2, mode: 'insensitive' } } },
          { travel: { name: { contains: search2, mode: 'insensitive' } } }
        ]
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            username: true,
            isActive: true
          }
        }
      },
      take: 10
    })
    
    console.log(`Search query: "${search2}"`)
    console.log(`Results found: ${packages2.length}`)
    if (packages2.length > 0) {
      console.log('\nResults:')
      packages2.forEach((pkg, i) => {
        console.log(`${i + 1}. ${pkg.name} (${pkg.travel.username})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testSearchAPI()
