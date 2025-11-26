const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLicenses() {
  try {
    const travel = await prisma.travel.findUnique({
      where: { username: 'testes3' }
    })

    if (!travel) {
      console.log('Travel testes3 tidak ditemukan')
      return
    }

    console.log('Travel testes3:')
    console.log('Username:', travel.username)
    console.log('Name:', travel.name)
    console.log('\nLicenses (raw):', travel.licenses)
    
    if (travel.licenses) {
      try {
        const licenses = JSON.parse(travel.licenses)
        console.log('\nLicenses (parsed):')
        console.log(JSON.stringify(licenses, null, 2))
        console.log('\nJumlah lisensi:', licenses.length)
      } catch (e) {
        console.log('Error parsing licenses:', e.message)
      }
    } else {
      console.log('\nTidak ada data lisensi')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLicenses()
