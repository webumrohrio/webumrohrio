'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageCropModal } from '@/components/image-crop-modal'
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Camera } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [mounted, setMounted] = useState(false)
  
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  useEffect(() => {
    setMounted(true)
    // Load current user data
    const user = localStorage.getItem('currentUser')
    if (user) {
      const userData = JSON.parse(user)
      setProfileData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || ''
      })
    } else {
      router.push('/login')
    }
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update profile in database
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const result = await response.json()

      if (result.success) {
        // Update localStorage with new data
        localStorage.setItem('currentUser', JSON.stringify(result.data))
        
        showNotification('Profil berhasil diperbarui!', 'success')
        setTimeout(() => router.push('/profile'), 1500)
      } else {
        showNotification(result.message || 'Gagal memperbarui profil', 'error')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      showNotification('Terjadi kesalahan saat memperbarui profil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Password baru tidak cocok!', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showNotification('Password minimal 6 karakter!', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileData.email,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        showNotification('Password berhasil diubah!', 'success')
      } else {
        showNotification(result.message || 'Gagal mengubah password', 'error')
      }
    } catch (error) {
      console.error('Change password error:', error)
      showNotification('Terjadi kesalahan saat mengubah password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          setSelectedImage(reader.result as string)
          setShowCropModal(true)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setLoading(true)
    
    try {
      // Upload cropped image to server
      const formData = new FormData()
      formData.append('file', croppedImageBlob, 'avatar.jpg')
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update profile with new avatar URL
        setProfileData({ ...profileData, avatar: result.url })
        showNotification('Foto berhasil diupload!', 'success')
      } else {
        showNotification(result.message || 'Gagal upload foto', 'error')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showNotification('Gagal upload foto', 'error')
    } finally {
      setLoading(false)
      setShowCropModal(false)
      setSelectedImage(null)
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
            <h1 className="text-lg font-bold text-primary">Edit Profil</h1>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-2xl px-4 py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-gray-100">
                      {mounted && profileData.name ? (
                        <Image
                          src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=10b981&color=fff&size=96`}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                        </div>
                      )}
                      {mounted && (
                        <button
                          type="button"
                          onClick={handleAvatarChange}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Klik icon kamera untuk upload foto</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
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
                        value={profileData.email}
                        className="pl-10 bg-gray-50"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nomor HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Old Password */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Password Lama</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="Masukkan password lama"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Password Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ulangi password baru"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
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

                  {/* Change Password Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Ubah Password'}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Image Crop Modal */}
        {showCropModal && selectedImage && (
          <ImageCropModal
            image={selectedImage}
            onClose={() => {
              setShowCropModal(false)
              setSelectedImage(null)
            }}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </MobileLayout>
  )
}
