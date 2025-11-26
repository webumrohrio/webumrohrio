'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookmarkCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RiwayatPage() {
  const router = useRouter()

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Riwayat Booking</h1>
          </div>
        </header>

        <div className="container mx-auto max-w-7xl px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookmarkCheck className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum Ada Riwayat</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Anda belum memiliki riwayat booking. Mulai booking paket umroh sekarang!
            </p>
            <Button onClick={() => router.push('/paket-umroh')}>
              Jelajahi Paket Umroh
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
