const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function migratePasswords() {
  try {
    console.log('🔄 Starting password migration...\n')

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    })

    console.log(`Found ${users.length} users\n`)

    let migratedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (user.password.startsWith('$2')) {
        console.log(`⏭️  Skipping ${user.email} - already hashed`)
        skippedCount++
        continue
      }

      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.password, 10)

      // Update user with hashed password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      console.log(`✅ Migrated ${user.email} - password hashed`)
      migratedCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✨ Migration completed!`)
    console.log(`   Migrated: ${migratedCount} users`)
    console.log(`   Skipped: ${skippedCount} users (already hashed)`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Error migrating passwords:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migratePasswords()
  .then(() => {
    console.log('\n✅ Password migration successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Password migration failed:', error)
    process.exit(1)
  })
