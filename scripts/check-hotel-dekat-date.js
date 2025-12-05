const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function checkDate() {
  try {
    const pkg = await db.package.findFirst({
      where: {
        name: { contains: 'Hotel Dekat' }
      },
      select: {
        name: true,
        departureDate: true,
        isActive: true,
        createdAt: true
      }
    })
    
    console.log('=== PACKAGE INFO ===')
    console.log('Name:', pkg.name)
    console.log('Departure Date:', pkg.departureDate)
    console.log('Is Active:', pkg.isActive)
    console.log('Created At:', pkg.createdAt)
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const departureDate = new Date(pkg.departureDate)
    departureDate.setHours(0, 0, 0, 0)
    
    console.log('\n=== DATE COMPARISON ===')
    console.log('Today (00:00):', now.toISOString())
    console.log('Departure (00:00):', departureDate.toISOString())
    console.log('Has Departed (departureDate <= now):', departureDate <= now)
    console.log('Is Future (departureDate > now):', departureDate > now)
    
    console.log('\n=== TAB CLASSIFICATION ===')
    if (departureDate <= now) {
      console.log('✗ This package will appear in "Sudah Berangkat" tab')
      console.log('✗ This package will NOT appear in "Paket Aktif" tab')
    } else {
      console.log('✓ This package will appear in "Paket Aktif" tab')
      console.log('✓ This package will NOT appear in "Sudah Berangkat" tab')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDate()
