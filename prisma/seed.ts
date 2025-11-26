import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Seed Admin (Default)
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      email: 'admin@tripbaitullah.com',
      role: 'superadmin',
      isActive: true
    }
  })
  console.log('✓ Default admin created')

  // Seed Users
  const user1 = await prisma.user.upsert({
    where: { email: 'rio@gmail.com' },
    update: {},
    create: {
      email: 'rio@gmail.com',
      password: '123456',
      name: 'Rio Pratama',
      phone: '+62 812 3456 7890',
      preferredLocation: 'Jakarta'
    }
  })
  console.log('✓ Users created')

  // Seed Travels
  const travel1 = await prisma.travel.upsert({
    where: { username: 'alhijaz-indowisata' },
    update: {},
    create: {
      username: 'alhijaz-indowisata',
      name: 'Alhijaz Indowisata',
      description: 'Travel umroh terpercaya dengan pengalaman lebih dari 15 tahun melayani jamaah umroh dan haji',
      logo: 'https://ui-avatars.com/api/?name=Alhijaz+Indowisata&background=10b981&color=fff&size=128&bold=true',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      phone: '+62 21 1234567',
      email: 'info@alhijaz.com',
      password: 'travel123',
      website: 'https://alhijaz.com',
      rating: 4.8,
      totalReviews: 150,
      totalJamaah: 5000,
      yearEstablished: 2008,
      isActive: true,
      isVerified: true
    }
  })

  const travel2 = await prisma.travel.upsert({
    where: { username: 'raudhah-travel' },
    update: {},
    create: {
      username: 'raudhah-travel',
      name: 'Raudhah Travel',
      description: 'Spesialis paket umroh keluarga dengan pelayanan terbaik dan harga terjangkau',
      logo: 'https://ui-avatars.com/api/?name=Raudhah+Travel&background=3b82f6&color=fff&size=128&bold=true',
      address: 'Jl. Ahmad Yani No. 456',
      city: 'Surabaya',
      phone: '+62 31 7654321',
      email: 'info@raudhah.com',
      password: 'travel123',
      website: 'https://raudhah.com',
      rating: 4.9,
      totalReviews: 200,
      totalJamaah: 7500,
      yearEstablished: 2005,
      isActive: true,
      isVerified: true
    }
  })

  const travel3 = await prisma.travel.upsert({
    where: { username: 'safira-travel' },
    update: {},
    create: {
      username: 'safira-travel',
      name: 'Safira Travel',
      description: 'Paket umroh hemat dengan fasilitas lengkap dan nyaman untuk seluruh keluarga',
      logo: 'https://ui-avatars.com/api/?name=Safira+Travel&background=f59e0b&color=fff&size=128&bold=true',
      address: 'Jl. Gatot Subroto No. 789',
      city: 'Medan',
      phone: '+62 61 9876543',
      email: 'info@safira.com',
      password: 'travel123',
      website: 'https://safira.com',
      rating: 4.6,
      totalReviews: 120,
      totalJamaah: 3500,
      yearEstablished: 2012,
      isActive: true,
      isVerified: false
    }
  })

  const travel4 = await prisma.travel.upsert({
    where: { username: 'baitul-makmur' },
    update: {},
    create: {
      username: 'baitul-makmur',
      name: 'Baitul Makmur Tour',
      description: 'Travel umroh dengan program terbaik dan pembimbing berpengalaman',
      logo: 'https://ui-avatars.com/api/?name=Baitul+Makmur&background=8b5cf6&color=fff&size=128&bold=true',
      address: 'Jl. Diponegoro No. 321',
      city: 'Bandung',
      phone: '+62 22 5551234',
      email: 'info@baitulmakmur.com',
      password: 'travel123',
      website: 'https://baitulmakmur.com',
      rating: 4.7,
      totalReviews: 180,
      totalJamaah: 6000,
      yearEstablished: 2010,
      isActive: true,
      isVerified: true
    }
  })

  console.log('✓ Travels created')

  // Seed Packages - dengan tanggal keberangkatan di masa depan
  const packages = [
    {
      name: 'Umroh Premium Ramadhan 2026',
      slug: 'umroh-premium-ramadhan-2026',
      description: 'Paket umroh premium dengan fasilitas bintang 5 di bulan Ramadhan',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
      price: 35000000,
      originalPrice: 42000000,
      cashback: 2500000,
      duration: '12 Hari',
      departureCity: 'Jakarta',
      departureDate: new Date('2026-03-15'),
      quota: 45,
      quotaAvailable: 12,
      category: 'premium',
      flightType: 'langsung',
      views: 250,
      bookingClicks: 45,
      isActive: true,
      isPinned: true,
      pinnedAt: new Date(),
      travelId: travel1.id
    },
    {
      name: 'Umroh Reguler Ekonomis',
      slug: 'umroh-reguler-ekonomis',
      description: 'Paket umroh hemat dengan fasilitas lengkap dan nyaman',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      price: 22000000,
      originalPrice: 25000000,
      cashback: 1500000,
      duration: '9 Hari',
      departureCity: 'Surabaya',
      departureDate: new Date('2026-04-10'),
      quota: 40,
      quotaAvailable: 25,
      category: 'reguler',
      flightType: 'langsung',
      views: 180,
      bookingClicks: 32,
      isActive: true,
      travelId: travel2.id
    },
    {
      name: 'Umroh Keluarga Plus Turki',
      slug: 'umroh-keluarga-plus-turki',
      description: 'Paket umroh keluarga dengan bonus tour Turki 3 hari',
      image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80',
      price: 48000000,
      originalPrice: 55000000,
      cashback: 3000000,
      duration: '16 Hari',
      departureCity: 'Bandung',
      departureDate: new Date('2026-05-20'),
      quota: 30,
      quotaAvailable: 18,
      category: 'keluarga',
      flightType: 'transit',
      views: 320,
      bookingClicks: 58,
      isActive: true,
      travelId: travel4.id
    },
    {
      name: 'Umroh Hemat Backpacker',
      slug: 'umroh-hemat-backpacker',
      description: 'Paket umroh super hemat untuk backpacker dengan fasilitas standar',
      image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
      price: 18000000,
      originalPrice: 21000000,
      cashback: 1000000,
      duration: '7 Hari',
      departureCity: 'Jakarta',
      departureDate: new Date('2026-02-25'),
      quota: 50,
      quotaAvailable: 35,
      category: 'hemat',
      flightType: 'transit',
      views: 150,
      bookingClicks: 28,
      isActive: true,
      travelId: travel3.id
    },
    {
      name: 'Umroh VIP Exclusive',
      slug: 'umroh-vip-exclusive',
      description: 'Paket umroh VIP dengan layanan eksklusif dan hotel mewah',
      image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800&q=80',
      price: 55000000,
      originalPrice: 65000000,
      cashback: 4000000,
      duration: '14 Hari',
      departureCity: 'Jakarta',
      departureDate: new Date('2026-06-01'),
      quota: 20,
      quotaAvailable: 8,
      category: 'premium',
      flightType: 'langsung',
      views: 420,
      bookingClicks: 72,
      isActive: true,
      travelId: travel1.id
    },
    {
      name: 'Umroh Plus Dubai',
      slug: 'umroh-plus-dubai',
      description: 'Paket umroh dengan bonus tour Dubai 2 hari',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      price: 42000000,
      originalPrice: 48000000,
      cashback: 2800000,
      duration: '13 Hari',
      departureCity: 'Medan',
      departureDate: new Date('2026-03-25'),
      quota: 35,
      quotaAvailable: 22,
      category: 'premium',
      flightType: 'langsung',
      views: 280,
      bookingClicks: 48,
      isActive: true,
      travelId: travel3.id
    },
    {
      name: 'Umroh Reguler Nyaman',
      slug: 'umroh-reguler-nyaman',
      description: 'Paket umroh reguler dengan kenyamanan maksimal',
      image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
      price: 28000000,
      originalPrice: 32000000,
      cashback: 2000000,
      duration: '10 Hari',
      departureCity: 'Yogyakarta',
      departureDate: new Date('2026-04-15'),
      quota: 40,
      quotaAvailable: 28,
      category: 'reguler',
      flightType: 'langsung',
      views: 195,
      bookingClicks: 35,
      isActive: true,
      travelId: travel2.id
    },
    {
      name: 'Umroh Keluarga Comfort',
      slug: 'umroh-keluarga-comfort',
      description: 'Paket umroh keluarga dengan fasilitas nyaman dan lengkap',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      price: 35000000,
      originalPrice: 40000000,
      cashback: 2500000,
      duration: '11 Hari',
      departureCity: 'Semarang',
      departureDate: new Date('2026-05-10'),
      quota: 30,
      quotaAvailable: 15,
      category: 'keluarga',
      flightType: 'langsung',
      views: 210,
      bookingClicks: 38,
      isActive: true,
      travelId: travel4.id
    }
  ]

  for (const pkg of packages) {
    await prisma.package.create({
      data: pkg
    })
  }
  console.log('✓ Packages created')

  // Seed Articles
  const articles = [
    {
      title: 'Panduan Lengkap Persiapan Umroh untuk Pemula',
      slug: 'panduan-lengkap-persiapan-umroh-untuk-pemula',
      excerpt: 'Pelajari semua yang perlu Anda ketahui sebelum berangkat umroh untuk pertama kalinya',
      content: '<p>Umroh adalah ibadah yang sangat dianjurkan dalam Islam...</p>',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
      tags: 'umroh,panduan,persiapan',
      views: 450,
      isPublished: true,
      adminId: null
    },
    {
      title: 'Tips Memilih Travel Umroh Terpercaya',
      slug: 'tips-memilih-travel-umroh-terpercaya',
      excerpt: 'Ketahui kriteria travel umroh yang aman dan terpercaya untuk perjalanan ibadah Anda',
      content: '<p>Memilih travel umroh yang tepat sangat penting...</p>',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      tags: 'umroh,travel,tips',
      views: 380,
      isPublished: true,
      adminId: null
    },
    {
      title: 'Doa-doa Penting Saat Umroh',
      slug: 'doa-doa-penting-saat-umroh',
      excerpt: 'Kumpulan doa-doa yang perlu dibaca saat melaksanakan ibadah umroh',
      content: '<p>Berikut adalah doa-doa penting yang perlu Anda hafal...</p>',
      image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80',
      tags: 'umroh,doa,ibadah',
      views: 520,
      isPublished: true,
      adminId: null
    }
  ]

  for (const article of articles) {
    await prisma.article.create({
      data: article
    })
  }
  console.log('✓ Articles created')

  // Seed Settings
  await prisma.settings.upsert({
    where: { key: 'departureCities' },
    update: {},
    create: {
      key: 'departureCities',
      value: 'Jakarta, Surabaya, Bandung, Medan, Semarang, Yogyakarta, Makassar, Palembang, Tangerang, Depok, Bekasi, Bogor, Malang, Bali, Balikpapan, Pontianak, Manado, Batam, Pekanbaru, Banjarmasin'
    }
  })

  await prisma.settings.upsert({
    where: { key: 'packageSortAlgorithm' },
    update: {},
    create: {
      key: 'packageSortAlgorithm',
      value: 'newest'
    }
  })

  await prisma.settings.upsert({
    where: { key: 'verifiedPriority' },
    update: {},
    create: {
      key: 'verifiedPriority',
      value: 'true'
    }
  })

  console.log('✓ Settings created')

  console.log('🎉 Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
