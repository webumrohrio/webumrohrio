const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setTravelPasswords() {
  console.log('🚀 Starting: Set default passwords for travels...\n')

  try {
    // Get all travels without password
    const travels = await prisma.travel.findMany({
      where: {
        OR: [
          { password: null },
          { password: '' }
        ]
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true
      }
    })

    console.log(`📦 Found ${travels.length} travels without password\n`)

    if (travels.length === 0) {
      console.log('✅ All travels already have passwords!')
      return
    }

    // Default password
    const defaultPassword = 'travel123' // Change this to something secure
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Update each travel
    for (const travel of travels) {
      // Set email if not exists (use username@tripbaitullah.com)
      const email = travel.email || `${travel.username}@tripbaitullah.com`

      await prisma.travel.update({
        where: { id: travel.id },
        data: {
          password: hashedPassword,
          email: email
        }
      })

      console.log(`✅ Updated: ${travel.name}`)
      console.log(`   Username: ${travel.username}`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${defaultPassword}`)
      console.log('')
    }

    console.log('\n✨ All travels updated successfully!')
    console.log('\n⚠️  IMPORTANT: Tell travels to change their password after first login!')
    console.log(`\nDefault credentials:`)
    console.log(`Email: [username]@tripbaitullah.com`)
    console.log(`Password: ${defaultPassword}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setTravelPasswords()
