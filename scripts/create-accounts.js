const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAccounts() {
  console.log('🔄 Creating new accounts...\n');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@2024', 10);
    const userPassword = await bcrypt.hash('User@2024', 10);

    // Create Admin
    const admin = await prisma.admin.upsert({
      where: { username: 'tripbaitullah' },
      update: {
        password: adminPassword,
        name: 'Trip Baitullah Admin',
        email: 'tripbaitullah.official@gmail.com',
        role: 'superadmin',
        isActive: true,
      },
      create: {
        username: 'tripbaitullah',
        password: adminPassword,
        name: 'Trip Baitullah Admin',
        email: 'tripbaitullah.official@gmail.com',
        role: 'superadmin',
        isActive: true,
      },
    });

    console.log('✅ Admin Account Created:');
    console.log('   Username: tripbaitullah');
    console.log('   Password: Admin@2024');
    console.log('   Email: tripbaitullah.official@gmail.com');
    console.log('   Role: superadmin');
    console.log('   Login URL: /admintrip/login\n');

    // Create User
    const user = await prisma.user.upsert({
      where: { email: 'user@tripbaitullah.com' },
      update: {
        password: userPassword,
        name: 'Trip Baitullah User',
        phone: '+62 812 3456 7890',
        preferredLocation: 'Jakarta',
      },
      create: {
        email: 'user@tripbaitullah.com',
        password: userPassword,
        name: 'Trip Baitullah User',
        phone: '+62 812 3456 7890',
        preferredLocation: 'Jakarta',
      },
    });

    console.log('✅ User Account Created:');
    console.log('   Email: user@tripbaitullah.com');
    console.log('   Password: User@2024');
    console.log('   Name: Trip Baitullah User');
    console.log('   Phone: +62 812 3456 7890');
    console.log('   Login URL: /login\n');

    console.log('🎉 Accounts created successfully!');
    console.log('\n📝 Summary:');
    console.log('   Admin: tripbaitullah / Admin@2024');
    console.log('   User: user@tripbaitullah.com / User@2024');

  } catch (error) {
    console.error('❌ Error creating accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();
