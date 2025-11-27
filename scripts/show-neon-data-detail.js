const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showData() {
  console.log('📊 Detailed Data in Neon PostgreSQL:\n');

  try {
    // Admins
    const admins = await prisma.admin.findMany({ select: { username: true, name: true, role: true } });
    console.log('👤 Admins:');
    admins.forEach(a => console.log(`   - ${a.username} (${a.name}) - ${a.role}`));

    // Users
    const users = await prisma.user.findMany({ select: { email: true, name: true } });
    console.log('\n👥 Users:');
    users.forEach(u => console.log(`   - ${u.email} (${u.name})`));

    // Travels
    const travels = await prisma.travel.findMany({ select: { username: true, name: true, city: true, isVerified: true } });
    console.log('\n🏢 Travels:');
    travels.forEach(t => console.log(`   - ${t.username} - ${t.name} (${t.city}) ${t.isVerified ? '✓' : ''}`));

    // Packages
    const packages = await prisma.package.findMany({ 
      select: { name: true, price: true, departureCity: true, travel: { select: { name: true } } },
      take: 10
    });
    console.log('\n📦 Packages (showing first 10):');
    packages.forEach(p => console.log(`   - ${p.name} - Rp ${p.price.toLocaleString()} (${p.departureCity}) by ${p.travel.name}`));

    // Articles
    const articles = await prisma.article.findMany({ select: { title: true, views: true } });
    console.log('\n📰 Articles:');
    articles.forEach(a => console.log(`   - ${a.title} (${a.views} views)`));

    // Settings
    const settings = await prisma.settings.findMany({ select: { key: true, value: true } });
    console.log('\n⚙️  Settings:');
    settings.forEach(s => console.log(`   - ${s.key}: ${s.value.substring(0, 50)}${s.value.length > 50 ? '...' : ''}`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showData();
