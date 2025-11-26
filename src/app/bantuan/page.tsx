'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BantuanPage() {
  const router = useRouter()

  const helpItems = [
    { icon: MessageCircle, label: 'Chat dengan CS', description: 'Hubungi customer service' },
    { icon: Phone, label: 'Telepon', description: '+62 812-3456-7890' },
    { icon: Mail, label: 'Email', description: 'support@tripbaitullah.com' },
    { icon: HelpCircle, label: 'FAQ', description: 'Pertanyaan yang sering diajukan' },
  ]

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Bantuan</h1>
          </div>
        </header>

        <div className="container mx-auto max-w-7xl px-4 py-6">
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-lg font-bold mb-2">Butuh Bantuan?</h2>
            <p className="text-sm text-muted-foreground">
              Tim kami siap membantu Anda 24/7. Pilih metode kontak yang Anda inginkan.
            </p>
          </Card>

          <Card className="divide-y">
            {helpItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => alert(`Menghubungi via ${item.label}`)}
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
