'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Bell, Globe, Moon, Shield, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PengaturanPage() {
  const router = useRouter()

  const settingItems = [
    { icon: Bell, label: 'Notifikasi', description: 'Atur preferensi notifikasi' },
    { icon: Globe, label: 'Bahasa', description: 'Indonesia' },
    { icon: Moon, label: 'Tema', description: 'Terang' },
    { icon: Shield, label: 'Privasi & Keamanan', description: 'Kelola data pribadi' },
  ]

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Pengaturan</h1>
          </div>
        </header>

        <div className="container mx-auto max-w-7xl px-4 py-6">
          <Card className="divide-y">
            {settingItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => alert(`Fitur ${item.label} akan segera hadir`)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
