'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Plane } from 'lucide-react'

export default function TravelAdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminWhatsapp, setAdminWhatsapp] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Fetch admin WhatsApp number and logo
  useEffect(() => {
    fetch('/api/settings?key=adminWhatsapp')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setAdminWhatsapp(result.data.value)
        }
      })
      .catch(err => console.error('Failed to fetch admin WhatsApp:', err))

    fetch('/api/settings?key=siteLogo')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data && result.data.value) {
          setLogoUrl(result.data.value)
        }
      })
      .catch(err => console.error('Failed to fetch logo:', err))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/travel-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()

      if (result.success) {
        // Save travel session to localStorage
        localStorage.setItem('travelAdminSession', JSON.stringify(result.data))
        localStorage.setItem('isTravelAdminLoggedIn', 'true')
        
        // Redirect to dashboard
        router.push('/travel-admin')
      } else {
        setError(result.error || 'Login gagal')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    const message = `Halo Admin Tripbaitullah,

Saya lupa password akun Travel Admin saya.

Username: ${username || '[username]'}

Mohon bantuan untuk reset password.

Terima kasih.`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = adminWhatsapp 
      ? `https://api.whatsapp.com/send?phone=${adminWhatsapp}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            {logoUrl ? (
              <div className="h-16 flex items-center">
                <img
                  src={logoUrl}
                  alt="Tripbaitullah"
                  className="h-full w-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Plane className="w-8 h-8 text-green-600" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Travel Admin Panel
          </h1>
          <p className="text-gray-600 text-sm">
            Kelola paket umroh Anda dengan mudah
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            onClick={handleForgotPassword}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Lupa Password? Hubungi Admin
          </Button>
        </div>


      </Card>
    </div>
  )
}
