const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

const sqlitePath = path.join(__dirname, '..', 'db', 'extracted-backup', 'database', 'custom.db');
const prisma = new PrismaClient();

// Helper functions
const toBool = (val) => val === 1 || val === true;
const toDate = (val) => val ? new Date(val) : null;

async function importData() {
  console.log('🔄 Importing backup data to Neon PostgreSQL...\n');

  try {
    const sqlite = new Database(sqlitePath, { readonly: true });
    console.log('✅ Connected to SQLite backup\n');

    let imported = 0;
    let skipped = 0;

    // Import Travels
    console.log('🏢 Importing Travels...');
    const travels = sqlite.prepare('SELECT * FROM Travel').all();
    for (const travel of travels) {
      try {
        await prisma.travel.create({
          data: {
            id: travel.id,
            username: travel.username,
            email: travel.email,
            password: travel.password,
            name: travel.name,
            description: travel.description,
            logo: travel.logo,
            coverImage: travel.coverImage,
            address: travel.address,
            city: travel.city,
            phone: travel.phone,
            website: travel.website,
            rating: travel.rating || 0,
            totalReviews: travel.totalReviews || 0,
            totalJamaah: travel.totalJamaah || 0,
            yearEstablished: travel.yearEstablished,
            licenses: travel.licenses,
            facilities: travel.facilities,
            services: travel.services,
            gallery: travel.gallery,
            legalDocs: travel.legalDocs,
            isActive: toBool(travel.isActive),
            isVerified: toBool(travel.isVerified),
            packageLimit: travel.packageLimit || 10,
            packageUsed: travel.packageUsed || 0,
            lastLogin: toDate(travel.lastLogin),
            createdAt: toDate(travel.createdAt),
            updatedAt: toDate(travel.updatedAt),
          },
        });
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error(`   ❌ Error importing ${travel.username}:`, error.message);
        }
      }
    }
    console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}\n`);

    // Import Packages
    imported = 0;
    skipped = 0;
    console.log('📦 Importing Packages...');
    const packages = sqlite.prepare('SELECT * FROM Package').all();
    for (const pkg of packages) {
      try {
        await prisma.package.create({
          data: {
            id: pkg.id,
            name: pkg.name,
            slug: pkg.slug,
            description: pkg.description,
            image: pkg.image,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            cashback: pkg.cashback || 0,
            duration: pkg.duration,
            departureCity: pkg.departureCity,
            departureDate: toDate(pkg.departureDate),
            returnDate: toDate(pkg.returnDate),
            quota: pkg.quota,
            quotaAvailable: pkg.quotaAvailable,
            rating: pkg.rating || 0,
            category: pkg.category,
            flightType: pkg.flightType,
            isBestSeller: toBool(pkg.isBestSeller),
            facilities: pkg.facilities,
            includes: pkg.includes,
            excludes: pkg.excludes,
            priceOptions: pkg.priceOptions,
            itinerary: pkg.itinerary,
            views: pkg.views || 0,
            bookingClicks: pkg.bookingClicks || 0,
            isActive: toBool(pkg.isActive),
            isPinned: toBool(pkg.isPinned),
            pinnedAt: toDate(pkg.pinnedAt),
            travelId: pkg.travelId,
            createdAt: toDate(pkg.createdAt),
            updatedAt: toDate(pkg.updatedAt),
          },
        });
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error(`   ❌ Error importing ${pkg.name}:`, error.message);
        }
      }
    }
    console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}\n`);

    // Import Videos
    imported = 0;
    skipped = 0;
    console.log('🎥 Importing Videos...');
    const videos = sqlite.prepare('SELECT * FROM Video').all();
    for (const video of videos) {
      try {
        await prisma.video.create({
          data: {
            id: video.id,
            title: video.title,
            description: video.description,
            youtubeUrl: video.youtubeUrl,
            videoId: video.videoId,
            thumbnail: video.thumbnail,
            location: video.location,
            isActive: toBool(video.isActive),
            createdAt: toDate(video.createdAt),
            updatedAt: toDate(video.updatedAt),
          },
        });
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error(`   ❌ Error importing video:`, error.message);
        }
      }
    }
    console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}\n`);

    // Import Sliders
    imported = 0;
    skipped = 0;
    console.log('🖼️  Importing Sliders...');
    const sliders = sqlite.prepare('SELECT * FROM Slider').all();
    for (const slider of sliders) {
      try {
        await prisma.slider.create({
          data: {
            id: slider.id,
            title: slider.title,
            description: slider.description,
            image: slider.image,
            link: slider.link,
            targetCity: slider.targetCity,
            order: slider.order || 0,
            isActive: toBool(slider.isActive),
            showOverlay: toBool(slider.showOverlay),
            objectFit: slider.objectFit || 'cover',
            createdAt: toDate(slider.createdAt),
            updatedAt: toDate(slider.updatedAt),
          },
        });
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error(`   ❌ Error importing slider:`, error.message);
        }
      }
    }
    console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}\n`);

    // Import Settings
    imported = 0;
    skipped = 0;
    console.log('⚙️  Importing Settings...');
    const settings = sqlite.prepare('SELECT * FROM Settings').all();
    for (const setting of settings) {
      try {
        await prisma.settings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            updatedAt: toDate(setting.updatedAt),
          },
          create: {
            id: setting.id,
            key: setting.key,
            value: setting.value,
            createdAt: toDate(setting.createdAt),
            updatedAt: toDate(setting.updatedAt),
          },
        });
        imported++;
      } catch (error) {
        console.error(`   ❌ Error importing setting ${setting.key}:`, error.message);
      }
    }
    console.log(`   ✅ Imported/Updated: ${imported}\n`);

    sqlite.close();

    console.log('✅ Import completed!\n');
    console.log('📊 Run check-neon-data.js to verify the data.');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
