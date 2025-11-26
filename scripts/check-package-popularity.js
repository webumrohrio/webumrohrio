const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Package Popularity...\n')

  // Find packages by name
  const packages = await prisma.package.findMany({
    where: {
      OR: [
        { name: { contains: 'Keluarga Comfort' } },
        { name: { contains: 'Plus Dubai' } }
      ]
    },
    include: {
      travel: {
        select: {
          name: true,
          username: true
        }
      }
    },
    orderBy: {
      views: 'desc'
    }
  })

  if (packages.length === 0) {
    console.log('❌ Paket tidak ditemukan')
    return
  }

  console.log('📊 HASIL ANALISIS POPULARITAS\n')
  console.log('═'.repeat(80))

  packages.forEach((pkg, index) => {
    console.log(`\n${index + 1}. ${pkg.name}`)
    console.log('─'.repeat(80))
    console.log(`   Travel: ${pkg.travel.name}`)
    console.log(`   Slug: ${pkg.slug || 'N/A'}`)
    console.log(`   \n   📈 METRIK POPULARITAS:`)
    console.log(`   • Views (Dilihat): ${pkg.views || 0} kali`)
    console.log(`   • Favorites (Difavoritkan): ${pkg.favorites || 0} kali`)
    console.log(`   • Booking Clicks: ${pkg.bookingClicks || 0} kali`)
    console.log(`   • Share Count: ${pkg.shareCount || 0} kali`)
    console.log(`   \n   💰 INFORMASI PAKET:`)
    console.log(`   • Harga: Rp ${pkg.price.toLocaleString('id-ID')}`)
    console.log(`   • Durasi: ${pkg.duration}`)
    console.log(`   • Kota Keberangkatan: ${pkg.departureCity}`)
    console.log(`   • Tanggal Keberangkatan: ${new Date(pkg.departureDate).toLocaleDateString('id-ID')}`)
    console.log(`   • Quota Tersedia: ${pkg.quotaAvailable}/${pkg.quota}`)
    console.log(`   • Status: ${pkg.isActive ? '✅ Aktif' : '❌ Tidak Aktif'}`)
    console.log(`   • Pinned: ${pkg.isPinned ? '📌 Ya' : 'Tidak'}`)
  })

  console.log('\n' + '═'.repeat(80))
  console.log('\n🏆 KESIMPULAN:\n')

  if (packages.length >= 2) {
    const pkg1 = packages[0]
    const pkg2 = packages[1]

    // Calculate popularity score
    const score1 = (pkg1.views || 0) * 1 + (pkg1.favorites || 0) * 3 + (pkg1.bookingClicks || 0) * 5 + (pkg1.shareCount || 0) * 2
    const score2 = (pkg2.views || 0) * 1 + (pkg2.favorites || 0) * 3 + (pkg2.bookingClicks || 0) * 5 + (pkg2.shareCount || 0) * 2

    console.log(`📊 Popularity Score:`)
    console.log(`   ${pkg1.name}: ${score1} poin`)
    console.log(`   ${pkg2.name}: ${score2} poin`)
    console.log(`\n   Formula: (Views × 1) + (Favorites × 3) + (Booking Clicks × 5) + (Shares × 2)`)

    if (score1 > score2) {
      console.log(`\n✨ PEMENANG: "${pkg1.name}"`)
      console.log(`   Lebih populer dengan selisih ${score1 - score2} poin`)
    } else if (score2 > score1) {
      console.log(`\n✨ PEMENANG: "${pkg2.name}"`)
      console.log(`   Lebih populer dengan selisih ${score2 - score1} poin`)
    } else {
      console.log(`\n🤝 SERI: Kedua paket memiliki popularitas yang sama`)
    }

    console.log(`\n📝 ALASAN:`)
    if (pkg1.views > pkg2.views) {
      console.log(`   • "${pkg1.name}" lebih banyak dilihat (${pkg1.views} vs ${pkg2.views})`)
    } else if (pkg2.views > pkg1.views) {
      console.log(`   • "${pkg2.name}" lebih banyak dilihat (${pkg2.views} vs ${pkg1.views})`)
    }

    if (pkg1.favorites > pkg2.favorites) {
      console.log(`   • "${pkg1.name}" lebih banyak difavoritkan (${pkg1.favorites} vs ${pkg2.favorites})`)
    } else if (pkg2.favorites > pkg1.favorites) {
      console.log(`   • "${pkg2.name}" lebih banyak difavoritkan (${pkg2.favorites} vs ${pkg1.favorites})`)
    }

    if (pkg1.bookingClicks > pkg2.bookingClicks) {
      console.log(`   • "${pkg1.name}" lebih banyak klik booking (${pkg1.bookingClicks} vs ${pkg2.bookingClicks})`)
    } else if (pkg2.bookingClicks > pkg1.bookingClicks) {
      console.log(`   • "${pkg2.name}" lebih banyak klik booking (${pkg2.bookingClicks} vs ${pkg1.bookingClicks})`)
    }
  } else {
    console.log('Hanya ditemukan 1 paket, tidak bisa dibandingkan.')
  }

  console.log('\n' + '═'.repeat(80))
  console.log('\n💡 CARA MEMBACA DATA:\n')
  console.log('1. Buka Prisma Studio: npx prisma studio')
  console.log('2. Pilih model "Package"')
  console.log('3. Cari paket berdasarkan nama')
  console.log('4. Lihat kolom: views, favorites, bookingClicks, shareCount')
  console.log('5. Bandingkan angka-angka tersebut')
  console.log('\nATAU gunakan script ini: node scripts/check-package-popularity.js')
  console.log('\n' + '═'.repeat(80))
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
