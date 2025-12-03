import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daftar Travel Umroh Terpercaya di Indonesia | Tripbaitullah',
  description: 'Temukan travel umroh terpercaya di Indonesia. Bandingkan layanan, harga, dan reputasi dari berbagai travel penyelenggara umroh. Pilih travel terbaik untuk perjalanan ibadah Anda.',
  keywords: [
    'travel umroh',
    'daftar travel umroh',
    'travel umroh terpercaya',
    'travel umroh Indonesia',
    'penyelenggara umroh',
    'agen umroh',
    'travel haji umroh',
    'cari travel umroh',
    'rekomendasi travel umroh'
  ],
  openGraph: {
    title: 'Daftar Travel Umroh Terpercaya di Indonesia',
    description: 'Temukan travel umroh terpercaya di Indonesia. Bandingkan layanan, harga, dan reputasi dari berbagai travel penyelenggara umroh.',
    url: 'https://www.tripbaitullah.com/travel-umroh',
    siteName: 'Tripbaitullah',
    images: [
      {
        url: 'https://www.tripbaitullah.com/og-travel-umroh.jpg',
        width: 1200,
        height: 630,
        alt: 'Daftar Travel Umroh Terpercaya',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daftar Travel Umroh Terpercaya di Indonesia',
    description: 'Temukan travel umroh terpercaya di Indonesia. Bandingkan layanan dan reputasi.',
    images: ['https://www.tripbaitullah.com/og-travel-umroh.jpg'],
  },
  alternates: {
    canonical: 'https://www.tripbaitullah.com/travel-umroh',
  },
  robots: {
    index: true,
    follow: true,
  },
}
