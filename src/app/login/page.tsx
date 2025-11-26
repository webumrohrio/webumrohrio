'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()
      
      if (result.success) {
        // Save login session
        localStorage.setItem('currentUser', JSON.stringify(result.data))
        localStorage.setItem('isLoggedIn', 'true')
        
        showNotification('Login berhasil!', 'success')
        setTimeout(() => router.push('/profile'), 1500)
      } else {
        showNotification(result.message || 'Email atau password salah!', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showNotification('Terjadi kesalahan saat login', 'error')
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
            <h1 className="text-lg font-bold text-primary">Masuk</h1>
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
            <h2 className="text-2xl font-bold text-primary mb-2">Selamat Datang</h2>
            <p className="text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
          </div>

          {/* Login Form */}
          <Card className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
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

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => alert('Fitur lupa password akan segera hadir')}
                >
                  Lupa password?
                </button>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </Card>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
