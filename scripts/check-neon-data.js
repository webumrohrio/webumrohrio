const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking data in Neon PostgreSQL...\n');

  try {
    const counts = {
      users: await prisma.user.count(),
      admins: await prisma.admin.count(),
      travels: await prisma.travel.count(),
      packages: await prisma.package.count(),
      articles: await prisma.article.count(),
      bookings: await prisma.booking.count(),
      videos: await prisma.video.count(),
      settings: await prisma.settings.count(),
      sliders: await prisma.slider.count(),
    };

    console.log('📊 Current Data Count:');
    console.log('   Users:', counts.users);
    console.log('   Admins:', counts.admins);
    console.log('   Travels:', counts.travels);
    console.log('   Packages:', counts.packages);
    console.log('   Articles:', counts.articles);
    console.log('   Bookings:', counts.bookings);
    console.log('   Videos:', counts.videos);
    console.log('   Settings:', counts.settings);
    console.log('   Sliders:', counts.sliders);

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log('\n   Total Records:', total);

    if (total === 0) {
      console.log('\n⚠️  Database is EMPTY! Need to import data.');
    } else {
      console.log('\n✅ Database has data!');
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
