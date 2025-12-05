const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testFix() {
  try {
    console.log('=== TESTING FIX: /api/packages?includeInactive=true&pageSize=1000 ===\n')
    
    const includeInactive = true
    const page = 1
    const pageSize = 1000  // NEW: Large pageSize
    const skip = (page - 1) * pageSize
    const take = pageSize
    
    const packages = await db.package.findMany({
      where: includeInactive ? {} : { 
        isActive: true,
        travel: {
          isActive: true
        }
      },
      include: {
        travel: {
          select: {
            id: true,
            name: true,
            username: true,
            isVerified: true,
            isActive: true
          }
        }
      },
      skip: skip,
      take: take
    })
    
    console.log('Total packages fetched:', packages.length)
    
    const hotelDekat = packages.find(p => p.name.includes('Hotel Dekat'))
    const dntPackages = packages.filter(p => p.travel.username === 'dnt')
    
    console.log('DNT packages:', dntPackages.length)
    console.log('\n=== RESULT ===')
    if (hotelDekat) {
      console.log('✅ SUCCESS! "Hotel Dekat" FOUND')
      console.log('   Name:', hotelDekat.name)
      console.log('   Travel:', hotelDekat.travel.username)
      console.log('   Created:', hotelDekat.createdAt)
    } else {
      console.log('❌ FAILED! "Hotel Dekat" NOT FOUND')
    }
    
    console.log('\n=== ALL DNT PACKAGES ===')
    dntPackages.forEach((pkg, i) => {
      const marker = pkg.name.includes('Hotel Dekat') ? '🎯' : '📦'
      console.log(`${marker} ${i + 1}. ${pkg.name}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testFix()
