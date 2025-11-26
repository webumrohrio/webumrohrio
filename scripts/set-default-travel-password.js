const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setDefaultPassword() {
  try {
    console.log('🔄 Setting default password for existing travels...')
    
    // Get all travels without password
    const travels = await prisma.travel.findMany({
      where: {
        OR: [
          { password: null },
          { password: '' }
        ]
      }
    })
    
    console.log(`📊 Found ${travels.length} travels without password`)
    
    // Default password: 123456
    const defaultPassword = '123456'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    
    // Update each travel
    for (const travel of travels) {
      await prisma.travel.update({
        where: { id: travel.id },
        data: { password: hashedPassword }
      })
      console.log(`✅ Set password for: ${travel.name} (${travel.username})`)
    }
    
    console.log('\n✅ All travels now have default password: 123456')
    console.log('⚠️  Please ask travel admins to change their password after first login!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setDefaultPassword()
