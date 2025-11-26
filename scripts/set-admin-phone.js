const { db } = require('../src/lib/db')

async function setAdminPhone() {
  try {
    // Check if adminPhone setting exists
    const existing = await db.setting.findUnique({
      where: { key: 'adminPhone' }
    })

    if (existing) {
      console.log('✅ Admin phone already exists:', existing.value)
      return
    }

    // Create adminPhone setting
    const setting = await db.setting.create({
      data: {
        key: 'adminPhone',
        value: '6281234567890', // Default number - change this to actual admin number
        description: 'Nomor WhatsApp Admin Tripbaitullah untuk bantuan'
      }
    })

    console.log('✅ Admin phone setting created:', setting.value)
    console.log('⚠️  Please update this number in the database or via admin panel')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setAdminPhone()
