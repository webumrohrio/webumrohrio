const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function migrateAdminPasswords() {
  try {
    console.log('🔄 Starting admin password migration...\n')

    const admins = await prisma.admin.findMany()
    console.log(`Found ${admins.length} admins\n`)

    let migratedCount = 0
    let skippedCount = 0

    for (const admin of admins) {
      // Check if password is already hashed
      if (admin.password.startsWith('$2')) {
        console.log(`⏭️  Skipping ${admin.username} - already hashed`)
        skippedCount++
        continue
      }

      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(admin.password, 10)

      // Update admin with hashed password
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })

      console.log(`✅ Migrated ${admin.username} (${admin.name}) - password hashed`)
      migratedCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✨ Migration completed!`)
    console.log(`   Migrated: ${migratedCount} admins`)
    console.log(`   Skipped: ${skippedCount} admins (already hashed)`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Error migrating passwords:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateAdminPasswords()
  .then(() => {
    console.log('\n✅ Admin password migration successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Admin password migration failed:', error)
    process.exit(1)
  })
