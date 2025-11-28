'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Plane, 
  Package, 
  FileText, 
  Video,
  Image as ImageIcon, 
  Settings, 
  Users,
  Database,
  LogOut,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admintrip' },
  { icon: Plane, label: 'Data Travel', href: '/admintrip/travels' },
  { icon: Package, label: 'Paket Umroh', href: '/admintrip/packages' },
  { icon: FileText, label: 'Artikel', href: '/admintrip/articles' },
  { icon: Video, label: 'Video', href: '/admintrip/videos' },
  { icon: ImageIcon, label: 'Gambar Slider', href: '/admintrip/sliders' },
  { icon: ShoppingBag, label: 'Data Booking', href: '/admintrip/bookings' },
  { icon: Database, label: 'Backup Data', href: '/admintrip/backup' },
  { icon: Settings, label: 'Pengaturan', href: '/admintrip/settings' },
  { icon: Users, label: 'Akun Pengguna', href: '/admintrip/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [adminName, setAdminName] = useState('Administrator')
  const [adminInitial, setAdminInitial] = useState('A')

  // Check authentication on mount and pathname change
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admintrip/login') {
      setIsChecking(false)
      setIsAuthenticated(true)
      return
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admintrip/verify', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
          
          // Fetch admin profile
          const profileRes = await fetch('/api/admintrip/profile')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            if (profileData.success && profileData.data) {
              setAdminName(profileData.data.name)
              setAdminInitial(profileData.data.name.charAt(0).toUpperCase())
            }
          }
        } else {
          router.push('/admintrip/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/admintrip/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    if (confirm('Yakin ingin logout?')) {
      try {
        await fetch('/api/admintrip/logout', {
          method: 'POST'
        })
        router.push('/admintrip/login')
      } catch (error) {
        console.error('Logout error:', error)
        router.push('/admintrip/login')
      }
    }
  }

  // Don't apply layout for login page
  if (pathname === '/admintrip/login') {
    return <>{children}</>
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <p className="text-xs text-gray-500">Tripbaitullah</p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full text-red-500 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:ml-0 ml-12">
                <h2 className="text-lg font-semibold text-gray-800">
                  {menuItems.find(item => item.href === pathname)?.label || 'Admin Panel'}
                </h2>
                <p className="text-sm text-gray-500">Kelola data website Anda</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{adminName}</p>
                  <p className="text-xs text-gray-500">Secure Session</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {adminInitial}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile - only show on mobile screens */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  )
}
