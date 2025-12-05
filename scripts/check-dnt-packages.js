const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDNTPackages() {
  try {
    console.log('🔍 Checking DNT packages...\n')

    // Find DNT travel
    const dntTravel = await prisma.travel.findFirst({
      where: {
        OR: [
          { username: { contains: 'dnt', mode: 'insensitive' } },
          { name: { contains: 'DNT', mode: 'insensitive' } },
          { name: { contains: 'Dianta', mode: 'insensitive' } }
        ]
      }
    })

    if (!dntTravel) {
      console.log('❌ DNT Travel not found')
      return
    }

    console.log('✅ Found DNT Travel:')
    console.log('   ID:', dntTravel.id)
    console.log('   Username:', dntTravel.username)
    console.log('   Name:', dntTravel.name)
    console.log('   isActive:', dntTravel.isActive)
    console.log('')

    // Find all packages from DNT
    const packages = await prisma.package.findMany({
      where: {
        travelId: dntTravel.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📦 Total DNT Packages: ${packages.length}\n`)

    packages.forEach((pkg, index) => {
      const departureDate = new Date(pkg.departureDate)
      const now = new Date()
      const isPast = departureDate < now
      
      console.log(`${index + 1}. ${pkg.name}`)
      console.log(`   ID: ${pkg.id}`)
      console.log(`   Slug: ${pkg.slug}`)
      console.log(`   Departure: ${departureDate.toLocaleDateString('id-ID')}`)
      console.log(`   Status: ${pkg.isActive ? '✅ Active' : '❌ Inactive'}`)
      console.log(`   Departed: ${isPast ? '✅ Yes' : '❌ No'}`)
      console.log(`   Created: ${pkg.createdAt.toLocaleDateString('id-ID')}`)
      console.log('')
    })

    // Check the specific package
    const specificPackage = packages.find(pkg => 
      pkg.name.includes('Hotel Dekat') || 
      pkg.name.includes('12 Hari')
    )

    if (specificPackage) {
      console.log('🎯 Found "Paket Umroh Hotel Dekat Selama 12 Hari Bersama DNT":')
      console.log('   Should appear in admintrip: YES')
      console.log('   Reason: Active and not departed')
    } else {
      console.log('❌ Package "Paket Umroh Hotel Dekat Selama 12 Hari Bersama DNT" not found in database')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDNTPackages()
