'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { ProfileSkeleton } from '@/components/profile-skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  BookmarkCheck, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Edit
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [favoriteCounts, setFavoriteCounts] = useState({ packages: 0, articles: 0 })
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
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

  const loadUserData = async () => {
    setLoading(true)
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (loggedIn && user) {
      setIsLoggedIn(true)
      const localUserData = JSON.parse(user)
      setUserData(localUserData)
      
      // Fetch latest data from database
      try {
        const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(localUserData.email)}`)
        const result = await response.json()
        
        if (result.success) {
          // Update localStorage with latest data
          localStorage.setItem('currentUser', JSON.stringify(result.data))
          setUserData(result.data)
          
          // Fetch favorite counts
          await loadFavoriteCounts(result.data.email, result.data.id)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }
    setLoading(false)
  }

  const loadFavoriteCounts = async (email: string, userId: string) => {
    try {
      // Fetch package favorites count
      const packagesResponse = await fetch(`/api/favorites?email=${encodeURIComponent(email)}`)
      const packagesResult = await packagesResponse.json()
      
      // Fetch article favorites count
      const articlesResponse = await fetch(`/api/articles/favorites?userId=${userId}`)
      const articlesResult = await articlesResponse.json()
      
      setFavoriteCounts({
        packages: packagesResult.success ? packagesResult.data.length : 0,
        articles: articlesResult.success ? articlesResult.data.length : 0
      })
    } catch (error) {
      console.error('Failed to fetch favorite counts:', error)
    }
  }

  useEffect(() => {
    loadUserData()
    
    // Reload data when page becomes visible (after returning from edit page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', loadUserData)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', loadUserData)
    }
  }, [])

  const handleMenuClick = (href: string, requiresLogin: boolean = false) => {
    if (requiresLogin && !isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    router.push(href)
  }

  const menuItems = [
    { icon: Heart, label: 'Paket Favorit', href: '/favorit', badge: favoriteCounts.packages, requiresLogin: true },
    { icon: BookmarkCheck, label: 'Artikel Favorit', href: '/favorit-artikel', badge: favoriteCounts.articles, requiresLogin: true },
    { icon: Settings, label: 'Pengaturan', href: '/pengaturan', requiresLogin: false },
    { icon: HelpCircle, label: 'Butuh Bantuan ?', href: '/bantuan', requiresLogin: false },
  ]

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background">
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            ></div>
            
            <div className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">Login Diperlukan</h3>
              
              <p className="text-center text-muted-foreground mb-6">
                Silakan login terlebih dahulu untuk mengakses fitur favorit
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLoginModal(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setShowLoginModal(false)
                    router.push('/login')
                  }}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}

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
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-lg md:text-xl font-bold text-primary">Profile</h1>
            <p className="text-xs text-muted-foreground">Kelola akun anda</p>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="container mx-auto max-w-7xl px-4 py-6 space-y-4">
            {/* Profile Card */}
            <Card className="p-6">
              {isLoggedIn && userData ? (
              <div className="space-y-4">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=10b981&color=fff&size=80`}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">{userData.name}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/profile/edit')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profil
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Nomor HP</p>
                      <p className="text-sm font-medium">{userData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => router.push('/login')}
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 opacity-40 grayscale">
                  <Image
                    src="https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=80"
                    alt="Profile"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-primary">Ketuk untuk masuk</h2>
                  <p className="text-sm text-muted-foreground">Untuk menyingkronkan aktivitas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </Card>

          {/* Menu Items */}
          <Card className="divide-y">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleMenuClick(item.href, item.requiresLogin)}
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="flex-1 font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-white bg-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </Card>

            {/* Logout Button (only show when logged in) */}
            {isLoggedIn && (
              <Card className="p-4">
                <Button
                  variant="outline"
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Clear login session
                    localStorage.removeItem('currentUser')
                    localStorage.removeItem('isLoggedIn')
                    setIsLoggedIn(false)
                    setUserData(null)
                    showNotification('Berhasil logout', 'success')
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </Card>
            )}

            {/* App Info */}
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>Tripbaitullah v1.0.0</p>
              <p className="mt-1">© 2025 All rights reserved</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
