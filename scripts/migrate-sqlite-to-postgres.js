const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

// SQLite database path (from extracted backup)
const sqlitePath = path.join(__dirname, '..', 'db', 'extracted-backup', 'database', 'custom.db');

// PostgreSQL Prisma Client
const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Starting migration from SQLite to PostgreSQL...\n');

  try {
    // Open SQLite database
    const sqlite = new Database(sqlitePath, { readonly: true });
    console.log('✅ Connected to SQLite database\n');

    // Get all data from SQLite
    console.log('📊 Reading data from SQLite...');
    
    const users = sqlite.prepare('SELECT * FROM User').all();
    const admins = sqlite.prepare('SELECT * FROM Admin').all();
    const travels = sqlite.prepare('SELECT * FROM Travel').all();
    const packages = sqlite.prepare('SELECT * FROM Package').all();
    const articles = sqlite.prepare('SELECT * FROM Article').all();
    const bookings = sqlite.prepare('SELECT * FROM Booking').all();
    const favorites = sqlite.prepare('SELECT * FROM Favorite').all();
    const articleFavorites = sqlite.prepare('SELECT * FROM ArticleFavorite').all();
    const articleComments = sqlite.prepare('SELECT * FROM ArticleComment').all();
    const videos = sqlite.prepare('SELECT * FROM Video').all();
    const settings = sqlite.prepare('SELECT * FROM Settings').all();
    const sliders = sqlite.prepare('SELECT * FROM Slider').all();

    console.log(`   Users: ${users.length}`);
    console.log(`   Admins: ${admins.length}`);
    console.log(`   Travels: ${travels.length}`);
    console.log(`   Packages: ${packages.length}`);
    console.log(`   Articles: ${articles.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Favorites: ${favorites.length}`);
    console.log(`   Article Favorites: ${articleFavorites.length}`);
    console.log(`   Article Comments: ${articleComments.length}`);
    console.log(`   Videos: ${videos.length}`);
    console.log(`   Settings: ${settings.length}`);
    console.log(`   Sliders: ${sliders.length}`);

    sqlite.close();

    console.log('\n🔄 Importing to PostgreSQL...\n');

    // Helper function to convert SQLite boolean (0/1) to PostgreSQL boolean
    const toBool = (val) => val === 1 || val === true;

    // Helper function to convert date strings
    const toDate = (val) => val ? new Date(val) : null;

    // Import Users
    if (users.length > 0) {
      console.log(`   Importing ${users.length} users...`);
      for (const user of users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            preferredLocation: user.preferredLocation,
            lastActive: toDate(user.lastActive),
            createdAt: toDate(user.createdAt),
            updatedAt: toDate(user.updatedAt),
          },
          create: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            preferredLocation: user.preferredLocation,
            lastActive: toDate(user.lastActive),
            createdAt: toDate(user.createdAt),
            updatedAt: toDate(user.updatedAt),
          },
        });
      }
    }

    // Import Admins
    if (admins.length > 0) {
      console.log(`   Importing ${admins.length} admins...`);
      for (const admin of admins) {
        try {
          await prisma.admin.upsert({
            where: { id: admin.id },
            update: {
              username: admin.username,
              password: admin.password,
              name: admin.name,
              email: admin.email,
              role: admin.role,
              isActive: toBool(admin.isActive),
              lastLogin: toDate(admin.lastLogin),
              createdAt: toDate(admin.createdAt),
              updatedAt: toDate(admin.updatedAt),
            },
            create: {
              id: admin.id,
              username: admin.username,
              password: admin.password,
              name: admin.name,
              email: admin.email,
              role: admin.role,
              isActive: toBool(admin.isActive),
              lastLogin: toDate(admin.lastLogin),
              createdAt: toDate(admin.createdAt),
              updatedAt: toDate(admin.updatedAt),
            },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`     ⚠️  Skipping admin ${admin.username} (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    // Import Travels
    if (travels.length > 0) {
      console.log(`   Importing ${travels.length} travels...`);
      for (const travel of travels) {
        await prisma.travel.upsert({
          where: { id: travel.id },
          update: {
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
          create: {
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
      }
    }

    // Import Packages
    if (packages.length > 0) {
      console.log(`   Importing ${packages.length} packages...`);
      for (const pkg of packages) {
        await prisma.package.upsert({
          where: { id: pkg.id },
          update: {
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
          create: {
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
      }
    }

    // Import Articles
    if (articles.length > 0) {
      console.log(`   Importing ${articles.length} articles...`);
      for (const article of articles) {
        await prisma.article.upsert({
          where: { id: article.id },
          update: {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            image: article.image,
            slug: article.slug,
            tags: article.tags,
            views: article.views || 0,
            isPublished: toBool(article.isPublished),
            travelId: article.travelId,
            adminId: article.adminId,
            createdAt: toDate(article.createdAt),
            updatedAt: toDate(article.updatedAt),
          },
          create: {
            id: article.id,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            image: article.image,
            slug: article.slug,
            tags: article.tags,
            views: article.views || 0,
            isPublished: toBool(article.isPublished),
            travelId: article.travelId,
            adminId: article.adminId,
            createdAt: toDate(article.createdAt),
            updatedAt: toDate(article.updatedAt),
          },
        });
      }
    }

    // Import other tables similarly...
    if (videos.length > 0) {
      console.log(`   Importing ${videos.length} videos...`);
      for (const video of videos) {
        await prisma.video.upsert({
          where: { id: video.id },
          update: video,
          create: video,
        });
      }
    }

    if (settings.length > 0) {
      console.log(`   Importing ${settings.length} settings...`);
      for (const setting of settings) {
        await prisma.settings.upsert({
          where: { id: setting.id },
          update: setting,
          create: setting,
        });
      }
    }

    if (sliders.length > 0) {
      console.log(`   Importing ${sliders.length} sliders...`);
      for (const slider of sliders) {
        await prisma.slider.upsert({
          where: { id: slider.id },
          update: {
            ...slider,
            isActive: toBool(slider.isActive),
            showOverlay: toBool(slider.showOverlay),
          },
          create: {
            ...slider,
            isActive: toBool(slider.isActive),
            showOverlay: toBool(slider.showOverlay),
          },
        });
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Run check-neon-data.js to verify the data.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
