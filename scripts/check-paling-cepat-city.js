const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkCity() {
  try {
    const pkg = await db.package.findFirst({
      where: {
        name: { contains: 'Paling Cepat', mode: 'insensitive' }
      },
      select: {
        name: true,
        departureCity: true,
        departureDate: true,
        price: true,
        travel: {
          select: {
            username: true
          }
        }
      }
    })
    
    console.log('=== PAKET PALING CEPAT ===')
    console.log(JSON.stringify(pkg, null, 2))
    
    // Check if it matches Pekanbaru
    if (pkg) {
      console.log('\n=== ANALYSIS ===')
      console.log('Departure City:', pkg.departureCity)
      console.log('Matches Pekanbaru?', pkg.departureCity.toLowerCase().includes('pekanbaru'))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkCity()
