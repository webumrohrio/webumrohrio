'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, HelpCircle, ChevronRight, MapPin, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BantuanPage() {
  const router = useRouter()
  const [adminPhone, setAdminPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('support@tripbaitullah.com')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactSettings()
  }, [])

  const fetchContactSettings = async () => {
    try {
      const [phoneRes, emailRes] = await Promise.all([
        fetch('/api/settings?key=adminPhone'),
        fetch('/api/settings?key=contactEmail')
      ])

      const [phoneData, emailData] = await Promise.all([
        phoneRes.json(),
        emailRes.json()
      ])

      if (phoneData.success && phoneData.data?.value) {
        setAdminPhone(phoneData.data.value)
      }

      if (emailData.success && emailData.data?.value) {
        setContactEmail(emailData.data.value)
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    if (!adminPhone) {
      alert('Nomor WhatsApp admin belum tersedia')
      return
    }
    
    // Format phone number (remove non-digits and add country code if needed)
    let phone = adminPhone.replace(/\D/g, '')
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1)
    } else if (!phone.startsWith('62')) {
      phone = '62' + phone
    }
    
    const message = encodeURIComponent('Halo Admin Tripbaitullah, Perkenalkan nama saya .....')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('Bantuan - Tripbaitullah')
    const body = encodeURIComponent('Halo,\n\nSaya butuh bantuan mengenai:\n\n')
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  const helpItems = [
    { 
      icon: 'whatsapp', 
      label: 'Chat dengan CS', 
      description: loading ? 'Memuat...' : (adminPhone || 'Hubungi customer service'),
      action: handleWhatsApp
    },
    { 
      icon: Mail, 
      label: 'Email', 
      description: contactEmail,
      action: handleEmail
    },
    { 
      icon: HelpCircle, 
      label: 'FAQ', 
      description: 'Pertanyaan yang sering diajukan',
      action: () => alert('Fitur FAQ akan segera hadir')
    },
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
          {/* Contact Info Card */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-green-600 mb-6">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Alamat</p>
                    <p className="text-sm text-gray-800 font-medium">
                      Jl. Raya Condet No. 27, Batu Ampar, Kramat Jati, Jakarta Timur, DKI Jakarta 13520
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-800 font-medium">ertourofficial@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Telepon</p>
                    <p className="text-sm text-gray-800 font-medium">{adminPhone || 'Memuat...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Help Options Card */}
          <Card className="divide-y mt-6">
            {helpItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={item.action}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.icon === 'whatsapp' ? 'bg-green-100' : 'bg-primary/10'
                }`}>
                  {item.icon === 'whatsapp' ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  ) : (
                    <item.icon className="w-5 h-5 text-primary" />
                  )}
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
