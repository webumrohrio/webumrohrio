import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paket Umroh Terlengkap - Bandingkan Harga & Jadwal | Tripbaitullah',
  description: 'Temukan dan bandingkan paket umroh dari berbagai travel terpercaya. Filter berdasarkan harga, jadwal keberangkatan, durasi, dan kota keberangkatan. Booking mudah dan aman.',
  keywords: [
    'paket umroh',
    'daftar paket umroh',
    'umroh murah',
    'paket umroh 2024',
    'paket umroh 2025',
    'umroh hemat',
    'bandingkan paket umroh',
    'cari paket umroh',
    'booking umroh'
  ],
  openGraph: {
    title: 'Paket Umroh Terlengkap - Bandingkan Harga & Jadwal',
    description: 'Temukan dan bandingkan paket umroh dari berbagai travel terpercaya. Filter berdasarkan harga, jadwal, dan kota keberangkatan.',
    url: 'https://www.tripbaitullah.com/paket-umroh',
    siteName: 'Tripbaitullah',
    images: [
      {
        url: 'https://www.tripbaitullah.com/og-paket-umroh.jpg',
        width: 1200,
        height: 630,
        alt: 'Paket Umroh Terlengkap',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paket Umroh Terlengkap - Bandingkan Harga & Jadwal',
    description: 'Temukan dan bandingkan paket umroh dari berbagai travel terpercaya',
    images: ['https://www.tripbaitullah.com/og-paket-umroh.jpg'],
  },
  alternates: {
    canonical: 'https://www.tripbaitullah.com/paket-umroh',
  },
  robots: {
    index: true,
    follow: true,
  },
}
