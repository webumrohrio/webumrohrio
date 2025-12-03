import { Metadata } from 'next'

export const metadata: Metadata = {
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
        url: 'https://www.tripbaitullah.com/og-artikel.jpg',
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
    images: ['https://www.tripbaitullah.com/og-artikel.jpg'],
  },
  alternates: {
    canonical: 'https://www.tripbaitullah.com/artikel',
  },
  robots: {
    index: true,
    follow: true,
  },
}
