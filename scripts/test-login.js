const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...\n')

    // Test data
    const testEmail = 'dera@gmail.com'
    const testPassword = '123456' // Assuming this is the password

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    })

    if (!user) {
      console.log(`❌ User ${testEmail} not found`)
      return
    }

    console.log(`✅ User found: ${user.name} (${user.email})`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
    console.log(`   Is hashed: ${user.password.startsWith('$2') ? 'Yes' : 'No'}\n`)

    // Test password verification
    if (user.password.startsWith('$2')) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`🔐 Testing password "${testPassword}":`)
      console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
      
      if (!isValid) {
        console.log('\n⚠️  Password does not match!')
        console.log('   This could mean:')
        console.log('   1. The password was changed')
        console.log('   2. The test password is incorrect')
        console.log('\n   Try checking what password was set in admin panel.')
      }
    } else {
      console.log(`🔐 Plain text password: ${user.password}`)
      console.log(`   Match: ${user.password === testPassword ? '✅ YES' : '❌ NO'}`)
    }

    console.log('\n' + '='.repeat(50))

    // List all users and their password status
    console.log('\n📋 All users password status:\n')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        password: true
      }
    })

    allUsers.forEach(u => {
      const isHashed = u.password.startsWith('$2')
      console.log(`   ${u.email}`)
      console.log(`   └─ ${isHashed ? '🔒 Hashed' : '⚠️  Plain text'}: ${u.password.substring(0, 30)}...`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
