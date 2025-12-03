import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { username: string; slug: string } 
}): Promise<Metadata> {
  try {
    const pkg = await prisma.package.findFirst({
      where: { 
        slug: params.slug,
        travel: {
          username: params.username
        }
      },
      include: {
        travel: true
      }
    })

    if (!pkg) {
      return {
        title: 'Paket Tidak Ditemukan | Tripbaitullah',
        description: 'Paket umroh yang Anda cari tidak ditemukan'
      }
    }

    const packageUrl = `https://www.tripbaitullah.com/${params.username}/paket/${pkg.slug}`
    const imageUrl = pkg.image 
      ? (pkg.image.startsWith('http') ? pkg.image : `https://www.tripbaitullah.com${pkg.image}`)
      : 'https://www.tripbaitullah.com/logo.png'

    const departureDate = new Date(pkg.departureDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const description = `Paket Umroh ${pkg.name} oleh ${pkg.travel.name}. Durasi ${pkg.duration}, keberangkatan ${departureDate} dari ${pkg.departureCity}. Harga mulai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}`

    return {
      title: `${pkg.name} - ${pkg.travel.name} | Tripbaitullah`,
      description: description,
      keywords: [
        'paket umroh',
        pkg.name,
        pkg.travel.name,
        pkg.departureCity,
        'umroh murah',
        'travel umroh',
        pkg.category
      ],
      authors: [{ name: pkg.travel.name }],
      openGraph: {
        title: `${pkg.name} - ${pkg.travel.name}`,
        description: description,
        url: packageUrl,
        siteName: 'Tripbaitullah',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: pkg.name,
          },
        ],
        locale: 'id_ID',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pkg.name} - ${pkg.travel.name}`,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: packageUrl,
      },
    }
  } catch (error) {
    console.error('Error generating package metadata:', error)
    return {
      title: 'Paket Umroh | Tripbaitullah',
      description: 'Temukan paket umroh terbaik untuk perjalanan ibadah Anda'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get package data for server component
export async function getPackage(username: string, slug: string) {
  try {
    const pkg = await prisma.package.findFirst({
      where: { 
        slug: slug,
        travel: {
          username: username
        }
      },
      include: {
        travel: true
      }
    })

    if (!pkg) {
      return null
    }

    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || '',
      image: pkg.image || '/logo.png',
      price: pkg.price,
      duration: pkg.duration,
      departureCity: pkg.departureCity,
      departureDate: pkg.departureDate.toISOString(),
      quota: pkg.quota,
      quotaAvailable: pkg.quotaAvailable,
      cashback: pkg.cashback || 0,
      category: pkg.category,
      slug: pkg.slug,
      travel: {
        id: pkg.travel.id,
        name: pkg.travel.name,
        rating: pkg.travel.rating || 0,
        logo: pkg.travel.logo,
        username: pkg.travel.username,
        isVerified: pkg.travel.isVerified || false,
        phone: pkg.travel.phone
      },
      priceOptions: (pkg.priceOptions as any) || [],
      facilities: (pkg.facilities as any) || [],
      itinerary: (pkg.itinerary as any) || [],
      includes: (pkg.includes as any) || [],
      excludes: (pkg.excludes as any) || []
    }
  } catch (error) {
    console.error('Error fetching package:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
