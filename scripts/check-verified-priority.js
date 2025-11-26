const { db } = require('../src/lib/db')

async function checkVerifiedPriority() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'verifiedPriority' }
    })

    console.log('Current verifiedPriority setting:', setting)

    if (!setting || setting.value === 'false') {
      console.log('\n⚠️  Verified priority is DISABLED or not set!')
      console.log('Setting it to TRUE now...\n')

      await db.setting.upsert({
        where: { key: 'verifiedPriority' },
        update: { value: 'true' },
        create: {
          key: 'verifiedPriority',
          value: 'true',
          description: 'Prioritize verified travel packages'
        }
      })

      console.log('✅ Verified priority has been ENABLED!')
    } else {
      console.log('✅ Verified priority is already ENABLED')
    }

    // Also check algorithm setting
    const algoSetting = await db.setting.findUnique({
      where: { key: 'packageSortAlgorithm' }
    })

    console.log('\nCurrent sort algorithm:', algoSetting?.value || 'newest (default)')

  } catch (error) {
    console.error('Error:', error)
  }
}

checkVerifiedPriority()
