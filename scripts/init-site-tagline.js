const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initSiteTagline() {
  try {
    console.log('🔄 Initializing site tagline...')
    
    // Check if siteTagline already exists
    const existing = await prisma.settings.findUnique({
      where: { key: 'siteTagline' }
    })
    
    if (existing) {
      console.log('✅ Site tagline already exists:', existing.value)
      console.log('   Skipping initialization.')
    } else {
      // Create new siteTagline setting
      await prisma.settings.create({
        data: {
          key: 'siteTagline',
          value: 'Smart Way to Go Baitullah'
        }
      })
      console.log('✅ Site tagline initialized: Smart Way to Go Baitullah')
    }
    
    console.log('\n✨ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initSiteTagline()
