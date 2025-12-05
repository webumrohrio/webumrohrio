const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testAPILogic() {
  try {
    console.log('=== TEST 1: includeInactive=true (NO username) ===')
    console.log('This simulates: /api/packages?includeInactive=true')
    console.log('Used by: admintrip/packages\n')
    
    const packages1 = await db.package.findMany({
      where: {
        // includeInactive=true means NO filter on isActive
        // But let's see what happens
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
      take: 100
    })
    
    const dntPackages1 = packages1.filter(p => p.travel.username === 'dnt')
    console.log('Total packages:', packages1.length)
    console.log('DNT packages:', dntPackages1.length)
    console.log('DNT package names:')
    dntPackages1.forEach(p => console.log(`  - ${p.name} (isActive: ${p.isActive})`))
    
    console.log('\n=== TEST 2: includeInactive=true + username=dnt ===')
    console.log('This simulates: /api/packages?username=dnt&includeInactive=true')
    console.log('Used by: travel-admin/packages\n')
    
    // Find travel first
    const travel = await db.travel.findUnique({
      where: { username: 'dnt' },
      select: { id: true }
    })
    
    const packages2 = await db.package.findMany({
      where: {
        travelId: travel.id
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
      }
    })
    
    console.log('Total DNT packages:', packages2.length)
    console.log('DNT package names:')
    packages2.forEach(p => console.log(`  - ${p.name} (isActive: ${p.isActive})`))
    
    console.log('\n=== COMPARISON ===')
    const hotelDekatInTest1 = dntPackages1.find(p => p.name.includes('Hotel Dekat'))
    const hotelDekatInTest2 = packages2.find(p => p.name.includes('Hotel Dekat'))
    
    console.log('Hotel Dekat in Test 1 (admintrip):', hotelDekatInTest1 ? 'FOUND ✓' : 'NOT FOUND ✗')
    console.log('Hotel Dekat in Test 2 (travel-admin):', hotelDekatInTest2 ? 'FOUND ✓' : 'NOT FOUND ✗')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testAPILogic()
