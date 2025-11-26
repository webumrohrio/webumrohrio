const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Travel Admin...')

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create or update travel admin
  const travel = await prisma.travel.upsert({
    where: { username: 'albarokah' },
    update: {},
    create: {
      username: 'albarokah',
      email: 'admin@albarokah.com',
      password: hashedPassword,
      name: 'Al Barokah Travel',
      description: 'Travel umroh terpercaya dengan pengalaman lebih dari 10 tahun melayani jamaah umroh ke tanah suci.',
      logo: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=400&fit=crop',
      address: 'Jl. Raya Condet No. 123, Jakarta Timur',
      city: 'Jakarta',
      phone: '021-12345678',
      website: 'https://albarokah.com',
      rating: 4.8,
      totalReviews: 150,
      totalJamaah: 2500,
      yearEstablished: 2013,
      isActive: true,
      isVerified: true,
      licenses: JSON.stringify([
        'PPIU: D/123/2023 (Valid until 2025-12-31)',
        'SIUP: SIUP/456/2023 (Valid until 2025-12-31)'
      ]),
      facilities: JSON.stringify([
        'Bimbingan Manasik',
        'Perlengkapan Umroh',
        'Asuransi Perjalanan',
        'Handling Bandara',
        'Tour Guide Berpengalaman'
      ]),
      services: JSON.stringify([
        'Umroh Reguler',
        'Umroh Plus Turki',
        'Umroh Ramadhan',
        'Umroh Haji Plus',
        'Umroh Keluarga'
      ])
    }
  })

  console.log('✅ Travel Admin created successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Username: ${travel.username}`)
  console.log(`Email: ${travel.email}`)
  console.log(`Password: admin123`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n🔗 Login URL: http://localhost:3000/travel-admin/login`)
  console.log(`\n✨ Travel ID: ${travel.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding travel admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
