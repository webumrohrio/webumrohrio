import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Props {
  params: {
    username: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch package data from database
    const packageData = await prisma.package.findFirst({
      where: {
        slug: params.slug,
        travel: {
          username: params.username
        }
      },
      include: {
        travel: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    if (!packageData) {
      return {
        title: 'Paket Tidak Ditemukan | Tripbaitullah',
        description: 'Paket umroh yang Anda cari tidak ditemukan'
      }
    }

    const title = `${packageData.name} - ${packageData.travel.name}`
    const description = packageData.description || `Paket ${packageData.name} dari ${packageData.travel.name}. Durasi ${packageData.duration}, berangkat dari ${packageData.departureCity}. Harga mulai Rp ${packageData.price.toLocaleString('id-ID')}`
    const image = packageData.image
    const url = `https://www.tripbaitullah.com/${params.username}/paket/${params.slug}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Tripbaitullah',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: packageData.name,
          },
        ],
        locale: 'id_ID',
        type: 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Paket Umroh | Tripbaitullah',
      description: 'Temukan paket umroh terbaik dari berbagai travel terpercaya'
    }
  }
}

export default function PackageDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
