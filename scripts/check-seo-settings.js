const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSEOSettings() {
  try {
    console.log('🔍 Checking SEO Settings in database...\n')
    
    const keys = ['metaTitle', 'metaDescription', 'metaKeywords', 'ogImage']
    
    for (const key of keys) {
      const setting = await prisma.settings.findUnique({
        where: { key }
      })
      
      if (setting) {
        console.log(`✅ ${key}:`)
        console.log(`   Value: ${setting.value}`)
        console.log(`   Updated: ${setting.updatedAt}\n`)
      } else {
        console.log(`❌ ${key}: NOT FOUND\n`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSEOSettings()
