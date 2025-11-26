'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState('')
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/settings?key=siteLogo')
      const result = await response.json()
      if (result.success && result.data?.value) {
        setLogo(result.data.value)
      }
    } catch (error) {
      console.error('Failed to fetch logo:', error)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('Password tidak cocok!', 'error')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showNotification('Pendaftaran berhasil! Silakan login.', 'success')
        setTimeout(() => router.push('/login'), 1500)
      } else {
        showNotification(result.message || 'Pendaftaran gagal!', 'error')
      }
    } catch (error) {
      console.error('Register error:', error)
      showNotification('Terjadi kesalahan saat pendaftaran', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout hideBottomNav>
      <div className="min-h-screen bg-gray-50">
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Daftar</h1>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-md px-4 py-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center p-3">
              {logo ? (
                <img
                  src={logo}
                  alt="Tripbaitullah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">TB</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Buat Akun Baru</h2>
            <p className="text-sm text-muted-foreground">Daftar untuk memulai</p>
          </div>

          {/* Register Form */}
          <Card className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  No. WhatsApp
                  <span className="text-xs text-muted-foreground ml-2">(Format: 62xxx)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    placeholder="628123456789"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                      
                      // Auto-add 62 prefix if user starts with 0
                      if (value.startsWith('0')) {
                        value = '62' + value.substring(1)
                      }
                      // Ensure it starts with 62
                      else if (value && !value.startsWith('62')) {
                        value = '62' + value
                      }
                      
                      setFormData({...formData, phone: value})
                    }}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contoh: 628123456789 (tanpa tanda +)
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                Dengan mendaftar, Anda menyetujui{' '}
                <button type="button" className="text-primary hover:underline">
                  Syarat & Ketentuan
                </button>
                {' '}dan{' '}
                <button type="button" className="text-primary hover:underline">
                  Kebijakan Privasi
                </button>
              </p>
            </form>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Masuk sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
