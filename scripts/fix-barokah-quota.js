/**
 * Script to manually fix packageUsed for barokahmadinahtour
 * Set it back to 3 (the original count before deletion)
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixBarokahQuota() {
  try {
    console.log('🔧 Fixing packageUsed for barokahmadinahtour...\n')

    const travel = await prisma.travel.update({
      where: { username: 'barokahmadinahtour' },
      data: {
        packageUsed: 3  // Set back to 3 (original count before deletion)
      }
    })

    console.log(`✅ ${travel.name} (${travel.username})`)
    console.log(`   packageUsed: ${travel.packageUsed}`)
    console.log(`   packageLimit: ${travel.packageLimit}`)
    console.log(`\n✨ Done! Quota restored to 3/10\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBarokahQuota()
