const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function initCelebrationSetting() {
  try {
    console.log('🎉 Initializing celebration feature setting...')
    
    // Check if setting already exists
    const existing = await prisma.settings.findUnique({
      where: { key: 'celebrationEnabled' }
    })

    if (existing) {
      console.log('✅ Celebration setting already exists:', existing.value)
      return
    }

    // Create setting
    await prisma.settings.create({
      data: {
        key: 'celebrationEnabled',
        value: 'true'
      }
    })

    console.log('✅ Celebration feature enabled by default')
    console.log('\n📝 Setting created:')
    console.log('   Key: celebrationEnabled')
    console.log('   Value: true')
    console.log('   Description: Enable/disable celebration popup for milestones')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initCelebrationSetting()
