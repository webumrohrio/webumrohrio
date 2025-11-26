const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  console.log('🔄 Exporting data from database...\n');

  try {
    // Export all data
    const data = {
      users: await prisma.user.findMany(),
      admins: await prisma.admin.findMany(),
      travels: await prisma.travel.findMany(),
      packages: await prisma.package.findMany(),
      articles: await prisma.article.findMany(),
      bookings: await prisma.booking.findMany(),
      favorites: await prisma.favorite.findMany(),
      articleFavorites: await prisma.articleFavorite.findMany(),
      articleComments: await prisma.articleComment.findMany(),
      videos: await prisma.video.findMany(),
      settings: await prisma.settings.findMany(),
      sliders: await prisma.slider.findMany(),
    };

    // Count records
    console.log('📊 Data Summary:');
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Admins: ${data.admins.length}`);
    console.log(`   Travels: ${data.travels.length}`);
    console.log(`   Packages: ${data.packages.length}`);
    console.log(`   Articles: ${data.articles.length}`);
    console.log(`   Bookings: ${data.bookings.length}`);
    console.log(`   Favorites: ${data.favorites.length}`);
    console.log(`   Article Favorites: ${data.articleFavorites.length}`);
    console.log(`   Article Comments: ${data.articleComments.length}`);
    console.log(`   Videos: ${data.videos.length}`);
    console.log(`   Settings: ${data.settings.length}`);
    console.log(`   Sliders: ${data.sliders.length}`);

    // Save to file
    const filename = `data-export-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log(`\n✅ Data exported to: ${filename}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Update DATABASE_URL in .env to Neon PostgreSQL');
    console.log('   2. Run: node scripts/import-data.js');

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
