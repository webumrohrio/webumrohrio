const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTravelInstagram() {
  try {
    const travel = await prisma.travel.findUnique({
      where: {
        username: 'ertour'
      },
      select: {
        id: true,
        username: true,
        name: true,
        instagram: true,
        email: true,
        phone: true,
        website: true,
        address: true
      }
    })

    if (!travel) {
      console.log('❌ Travel "ertour" tidak ditemukan')
      return
    }

    console.log('✅ Travel ditemukan:')
    console.log('ID:', travel.id)
    console.log('Username:', travel.username)
    console.log('Name:', travel.name)
    console.log('Instagram:', travel.instagram || '(belum diisi)')
    console.log('Email:', travel.email)
    console.log('Phone:', travel.phone)
    console.log('Website:', travel.website)
    console.log('Address:', travel.address)

    if (!travel.instagram) {
      console.log('\n⚠️  Field Instagram masih kosong!')
      console.log('Silakan isi data Instagram melalui halaman Travel Admin Profile')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTravelInstagram()
