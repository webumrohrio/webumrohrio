const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdminPasswords() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        username: true,
        password: true,
        name: true
      }
    })

    console.log('Admin Passwords Status:\n')
    admins.forEach(admin => {
      const isHashed = admin.password.startsWith('$2')
      console.log(`Username: ${admin.username}`)
      console.log(`Name: ${admin.name}`)
      console.log(`Password: ${admin.password.substring(0, 30)}...`)
      console.log(`Status: ${isHashed ? '🔒 HASHED' : '⚠️  PLAIN TEXT'}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPasswords()
