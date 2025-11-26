const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  // Find the latest export file
  const files = fs.readdirSync('.').filter(f => f.startsWith('data-export-') && f.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('❌ No export file found. Run export-data.js first.');
    process.exit(1);
  }

  const filename = files.sort().reverse()[0];
  console.log(`📂 Importing data from: ${filename}\n`);

  try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

    console.log('🔄 Importing data to database...\n');

    // Import in order (respecting foreign keys)
    
    // 1. Users
    if (data.users.length > 0) {
      console.log(`   Importing ${data.users.length} users...`);
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }
    }

    // 2. Admins
    if (data.admins.length > 0) {
      console.log(`   Importing ${data.admins.length} admins...`);
      for (const admin of data.admins) {
        await prisma.admin.upsert({
          where: { id: admin.id },
          update: admin,
          create: admin,
        });
      }
    }

    // 3. Travels
    if (data.travels.length > 0) {
      console.log(`   Importing ${data.travels.length} travels...`);
      for (const travel of data.travels) {
        await prisma.travel.upsert({
          where: { id: travel.id },
          update: travel,
          create: travel,
        });
      }
    }

    // 4. Packages
    if (data.packages.length > 0) {
      console.log(`   Importing ${data.packages.length} packages...`);
      for (const pkg of data.packages) {
        await prisma.package.upsert({
          where: { id: pkg.id },
          update: pkg,
          create: pkg,
        });
      }
    }

    // 5. Articles
    if (data.articles.length > 0) {
      console.log(`   Importing ${data.articles.length} articles...`);
      for (const article of data.articles) {
        await prisma.article.upsert({
          where: { id: article.id },
          update: article,
          create: article,
        });
      }
    }

    // 6. Bookings
    if (data.bookings.length > 0) {
      console.log(`   Importing ${data.bookings.length} bookings...`);
      for (const booking of data.bookings) {
        await prisma.booking.upsert({
          where: { id: booking.id },
          update: booking,
          create: booking,
        });
      }
    }

    // 7. Favorites
    if (data.favorites.length > 0) {
      console.log(`   Importing ${data.favorites.length} favorites...`);
      for (const favorite of data.favorites) {
        await prisma.favorite.upsert({
          where: { id: favorite.id },
          update: favorite,
          create: favorite,
        });
      }
    }

    // 8. Article Favorites
    if (data.articleFavorites.length > 0) {
      console.log(`   Importing ${data.articleFavorites.length} article favorites...`);
      for (const fav of data.articleFavorites) {
        await prisma.articleFavorite.upsert({
          where: { id: fav.id },
          update: fav,
          create: fav,
        });
      }
    }

    // 9. Article Comments
    if (data.articleComments.length > 0) {
      console.log(`   Importing ${data.articleComments.length} article comments...`);
      for (const comment of data.articleComments) {
        await prisma.articleComment.upsert({
          where: { id: comment.id },
          update: comment,
          create: comment,
        });
      }
    }

    // 10. Videos
    if (data.videos.length > 0) {
      console.log(`   Importing ${data.videos.length} videos...`);
      for (const video of data.videos) {
        await prisma.video.upsert({
          where: { id: video.id },
          update: video,
          create: video,
        });
      }
    }

    // 11. Settings
    if (data.settings.length > 0) {
      console.log(`   Importing ${data.settings.length} settings...`);
      for (const setting of data.settings) {
        await prisma.settings.upsert({
          where: { id: setting.id },
          update: setting,
          create: setting,
        });
      }
    }

    // 12. Sliders
    if (data.sliders.length > 0) {
      console.log(`   Importing ${data.sliders.length} sliders...`);
      for (const slider of data.sliders) {
        await prisma.slider.upsert({
          where: { id: slider.id },
          update: slider,
          create: slider,
        });
      }
    }

    console.log('\n✅ Data import completed successfully!');

  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
