const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOGImage() {
  try {
    console.log('🔍 Checking OG Image setting in database...\n')
    
    const ogImageSetting = await prisma.settings.findUnique({
      where: { key: 'ogImage' }
    })
    
    if (ogImageSetting) {
      console.log('✅ OG Image found in database:')
      console.log('Key:', ogImageSetting.key)
      console.log('Value:', ogImageSetting.value)
      console.log('Updated At:', ogImageSetting.updatedAt)
      
      // Check if it's the Cloudinary URL
      if (ogImageSetting.value.includes('cloudinary')) {
        console.log('\n✅ Using Cloudinary URL (correct!)')
      } else {
        console.log('\n⚠️ Not using Cloudinary URL')
      }
    } else {
      console.log('❌ OG Image setting not found in database!')
    }
    
    // Also check other metadata
    console.log('\n📋 Other metadata settings:')
    const [metaTitle, metaDesc] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'metaTitle' } }),
      prisma.settings.findUnique({ where: { key: 'metaDescription' } })
    ])
    
    console.log('Meta Title:', metaTitle?.value || 'Not set')
    console.log('Meta Description:', metaDesc?.value || 'Not set')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOGImage()
