'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  User, 
  LogOut,
  Menu,
  Plane,
  Settings
} from 'lucide-react'
import Image from 'next/image'
import { Toaster } from 'sonner'

interface TravelSession {
  id: string
  username: string
  email: string
  name: string
  logo?: string
  role: string
}

function LogoSection() {
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/settings?key=siteLogo')
      const result = await response.json()
      
      if (result.success && result.data && result.data.value) {
        setLogoUrl(result.data.value)
      }
    } catch (error) {
      console.error('Error fetching logo:', error)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <div className="h-10 flex items-center">
          <img
            src={logoUrl}
            alt="Tripbaitullah"
            className="h-full w-auto object-contain"
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Plane className="w-6 h-6 text-green-600" />
        </div>
      )}
      <div>
        <h1 className="font-bold text-[#05968f]">Tripbaitullah</h1>
        <p className="text-xs text-gray-500">Panel Kelola</p>
      </div>
    </div>
  )
}

export default function TravelAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [travelSession, setTravelSession] = useState<TravelSession | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminPhone, setAdminPhone] = useState('6281234567890') // Default number

  useEffect(() => {
    // Check if travel admin is logged in
    const isLoggedIn = localStorage.getItem('isTravelAdminLoggedIn')
    const session = localStorage.getItem('travelAdminSession')

    if (!isLoggedIn || !session) {
      // Redirect to login if not on login page
      if (pathname !== '/travel-admin/login') {
        router.push('/travel-admin/login')
      }
    } else {
      setTravelSession(JSON.parse(session))
    }
  }, [pathname, router])

  // Fetch admin phone number
  useEffect(() => {
    const fetchAdminPhone = async () => {
      try {
        const response = await fetch('/api/settings?key=adminPhone')
        const result = await response.json()
        if (result.success && result.data?.value) {
          setAdminPhone(result.data.value)
        }
      } catch (error) {
        console.error('Failed to fetch admin phone:', error)
      }
    }
    fetchAdminPhone()
  }, [])

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      localStorage.removeItem('travelAdminSession')
      localStorage.removeItem('isTravelAdminLoggedIn')
      router.push('/travel-admin/login')
    }
  }

  // Don't show layout on login page
  if (pathname === '/travel-admin/login') {
    return <>{children}</>
  }

  // Show loading while checking session
  if (!travelSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/travel-admin' },
    { icon: Package, label: 'Paket Umroh', href: '/travel-admin/packages' },
    { icon: User, label: 'Profil Travel', href: '/travel-admin/profile' },
    { icon: Settings, label: 'Pengaturan', href: '/travel-admin/settings' },
  ]

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <LogoSection />
        </div>



        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Help & Logout Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          {/* Help Button */}
          <a
            href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`Halo Admintrip, Saya Admin Travel ${travelSession?.name || ''}, Butuh Bantuan`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              type="button"
              className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg 
                className="w-5 h-5 mr-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="font-semibold">Butuh Bantuan?</span>
            </Button>
          </a>
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-[#05968f]">Tripbaitullah</h1>
            {/* Travel Logo - Mobile Only */}
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center overflow-hidden">
              {travelSession.logo ? (
                <Image
                  src={travelSession.logo}
                  alt={travelSession.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-green-700 font-bold text-sm">
                  {travelSession.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Header - Travel Info */}
        <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3 flex items-center justify-end">
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center overflow-hidden">
                {travelSession.logo ? (
                  <Image
                    src={travelSession.logo}
                    alt={travelSession.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-green-700 font-bold text-base">
                    {travelSession.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {travelSession.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  @{travelSession.username}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      </div>
    </>
  )
}
