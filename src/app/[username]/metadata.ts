import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate metadata for travel profile page
export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  try {
    const travel = await prisma.travel.findUnique({
      where: { username: params.username },
      include: {
        _count: {
          select: { packages: true }
        }
      }
    })

    if (!travel) {
      return {
        title: 'Travel Tidak Ditemukan | Tripbaitullah',
        description: 'Travel yang Anda cari tidak ditemukan'
      }
    }

    const travelUrl = `https://www.tripbaitullah.com/${travel.username}`
    const logoUrl = travel.logo 
      ? (travel.logo.startsWith('http') ? travel.logo : `https://www.tripbaitullah.com${travel.logo}`)
      : 'https://www.tripbaitullah.com/logo.png'

    const description = travel.description 
      ? travel.description.substring(0, 160) 
      : `${travel.name} - Travel umroh terpercaya di ${travel.city || 'Indonesia'}. Menyediakan ${travel._count.packages} paket umroh dengan berbagai pilihan jadwal dan harga.`

    return {
      title: `${travel.name} - Travel Umroh ${travel.isVerified ? 'Terpercaya' : ''} | Tripbaitullah`,
      description: description,
      keywords: [
        travel.name,
        'travel umroh',
        `travel umroh ${travel.city}`,
        'paket umroh',
        'umroh terpercaya',
        travel.isVerified ? 'travel verified' : '',
        'booking umroh'
      ].filter(Boolean),
      authors: [{ name: travel.name }],
      openGraph: {
        title: `${travel.name} - Travel Umroh ${travel.isVerified ? 'Terpercaya' : ''}`,
        description: description,
        url: travelUrl,
        siteName: 'Tripbaitullah',
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: travel.name,
          },
        ],
        locale: 'id_ID',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${travel.name} - Travel Umroh`,
        description: description,
        images: [logoUrl],
      },
      alternates: {
        canonical: travelUrl,
      },
    }
  } catch (error) {
    console.error('Error generating travel metadata:', error)
    return {
      title: 'Travel Umroh | Tripbaitullah',
      description: 'Profil travel umroh terpercaya'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get travel data for server component
export async function getTravel(username: string) {
  try {
    const travel = await prisma.travel.findUnique({
      where: { username: username },
      include: {
        _count: {
          select: { packages: true }
        }
      }
    })

    if (!travel) {
      return null
    }

    return {
      id: travel.id,
      username: travel.username || '',
      name: travel.name,
      description: travel.description || '',
      logo: travel.logo || '/logo.png',
      coverImage: travel.coverImage || '',
      address: travel.address || '',
      city: travel.city || '',
      phone: travel.phone || '',
      email: travel.email || '',
      website: travel.website || '',
      instagram: travel.instagram || '',
      rating: travel.rating || 0,
      totalReviews: 0, // Can be calculated if you have reviews table
      totalJamaah: 0, // Can be calculated from bookings
      yearEstablished: travel.yearEstablished || new Date().getFullYear(),
      licenses: (travel.licenses as any) || [],
      facilities: (travel.facilities as any) || [],
      services: (travel.services as any) || [],
      gallery: (travel.gallery as any) || [],
      legalDocs: (travel.legalDocs as any) || [],
      isVerified: travel.isVerified || false,
      isActive: travel.isActive || true,
      packagesCount: travel._count.packages
    }
  } catch (error) {
    console.error('Error fetching travel:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
