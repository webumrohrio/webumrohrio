const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
      console.log('Usage: node scripts/reset-user-password.js <email> <password>')
      console.log('Example: node scripts/reset-user-password.js dera@gmail.com 123456')
      process.exit(1)
    }

    console.log(`🔄 Resetting password for ${email}...\n`)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`❌ User ${email} not found`)
      process.exit(1)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log(`✅ Password reset successful!`)
    console.log(`   User: ${user.name} (${email})`)
    console.log(`   New password: ${newPassword}`)
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`)

    // Test the password
    const isValid = await bcrypt.compare(newPassword, hashedPassword)
    console.log(`\n🧪 Verification test: ${isValid ? '✅ PASSED' : '❌ FAILED'}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
