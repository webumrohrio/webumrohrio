import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateMetadata(): Promise<Metadata> {
  try {
    const ogImageSetting = await prisma.settings.findUnique({
      where: { key: 'ogImage' }
    })

    const ogImage = ogImageSetting?.value || '/og-image.png'
    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `https://www.tripbaitullah.com${ogImage}`

    return {
      title: 'Artikel Umroh & Tips Perjalanan Ibadah | Tripbaitullah',
      description: 'Baca artikel informatif seputar umroh, tips perjalanan ibadah, panduan umroh, dan informasi terkini tentang ibadah umroh. Update artikel terbaru dari para ahli dan travel berpengalaman.',
      keywords: [
        'artikel umroh',
        'tips umroh',
        'panduan umroh',
        'informasi umroh',
        'persiapan umroh',
        'artikel ibadah',
        'blog umroh',
        'berita umroh',
        'tips perjalanan umroh'
      ],
      openGraph: {
        title: 'Artikel Umroh & Tips Perjalanan Ibadah',
        description: 'Baca artikel informatif seputar umroh, tips perjalanan ibadah, dan panduan umroh dari para ahli.',
        url: 'https://www.tripbaitullah.com/artikel',
        siteName: 'Tripbaitullah',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: 'Artikel Umroh & Tips Perjalanan',
          },
        ],
        locale: 'id_ID',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Artikel Umroh & Tips Perjalanan Ibadah',
        description: 'Baca artikel informatif seputar umroh dan tips perjalanan ibadah',
        images: [ogImageUrl],
      },
      alternates: {
        canonical: 'https://www.tripbaitullah.com/artikel',
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Artikel Umroh & Tips Perjalanan | Tripbaitullah',
      description: 'Baca artikel informatif seputar umroh dan tips perjalanan ibadah'
    }
  } finally {
    await prisma.$disconnect()
  }
}
