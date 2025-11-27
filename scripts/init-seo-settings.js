const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initSEOSettings() {
  try {
    console.log('🔄 Initializing SEO settings...')
    
    const settings = [
      {
        key: 'metaDescription',
        value: 'Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya. Nikmati kemudahan memilih paket umroh sesuai kebutuhan Anda.',
        description: 'Meta Description untuk SEO'
      },
      {
        key: 'ogImage',
        value: '/og-image.png',
        description: 'Open Graph Image untuk social media preview'
      }
    ]
    
    for (const setting of settings) {
      const existing = await prisma.settings.findUnique({
        where: { key: setting.key }
      })
      
      if (existing) {
        console.log(`✅ ${setting.description} already exists:`, existing.value)
      } else {
        await prisma.settings.create({
          data: {
            key: setting.key,
            value: setting.value
          }
        })
        console.log(`✅ ${setting.description} initialized:`, setting.value)
      }
    }
    
    console.log('\n✨ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initSEOSettings()
