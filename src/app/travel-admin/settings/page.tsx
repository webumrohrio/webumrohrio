'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function TravelAdminSettings() {
  const [travelData, setTravelData] = useState<any>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (session) {
      setTravelData(JSON.parse(session))
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/travel-admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelId: travelData.id,
          currentPassword,
          newPassword
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('Password berhasil diubah!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(result.error || 'Gagal mengubah password')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-600">Kelola akun dan keamanan</p>
      </div>

      {/* Account Info */}
      {travelData && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Informasi Akun</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{travelData.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nama Travel</p>
              <p className="font-medium">{travelData.name}</p>
            </div>
            {travelData.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{travelData.email}</p>
              </div>
            )}
            {travelData.phone && (
              <div>
                <p className="text-sm text-gray-600">Nomor Telepon</p>
                <p className="font-medium">{travelData.phone}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ubah Password</h2>
            <p className="text-sm text-gray-600">Pastikan password Anda aman</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Lama *
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
                placeholder="Masukkan password lama"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Baru *
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
                placeholder="Masukkan password baru"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password Baru *
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ketik ulang password baru"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </div>
            ) : (
              'Ubah Password'
            )}
          </Button>
        </form>
      </Card>

      {/* Security Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips Keamanan</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Gunakan password minimal 6 karakter</li>
          <li>• Kombinasikan huruf, angka, dan simbol</li>
          <li>• Jangan gunakan password yang sama dengan akun lain</li>
          <li>• Ubah password secara berkala</li>
        </ul>
      </Card>
    </div>
  )
}
