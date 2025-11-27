'use client'

import { BottomNavigation } from './bottom-navigation'
import { cn } from '@/lib/utils'
import { Home, PlaneTakeoff, Users, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useUserHeartbeat } from '@/hooks/useUserHeartbeat'

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  hideBottomNav?: boolean
}

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: PlaneTakeoff, label: 'Paket Umroh', href: '/paket-umroh' },
  { icon: Users, label: 'Travel Umroh', href: '/travel-umroh' },
  { icon: FileText, label: 'Artikel', href: '/artikel' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileLayout({ children, className, hideBottomNav = false }: MobileLayoutProps) {
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState('')
  const [siteTagline, setSiteTagline] = useState('Smart Way to Go Baitullah')
  
  // Initialize heartbeat system for tracking user online status
  useUserHeartbeat()

  useEffect(() => {
    fetchLogo()
    fetchTagline()
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

  const fetchTagline = async () => {
    try {
      const response = await fetch('/api/settings?key=siteTagline')
      const result = await response.json()
      
      if (result.success && result.data && result.data.value) {
        setSiteTagline(result.data.value)
      }
    } catch (error) {
      console.error('Error fetching tagline:', error)
    }
  }
  
  return (
    <div className={cn('min-h-screen bg-background relative', className)}>
      {/* Desktop Header Navigation - Only visible on desktop */}
      {!hideBottomNav && (
        <header className="hidden md:block bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                {logoUrl && (
                  <div className="h-10 flex items-center">
                    <img
                      src={logoUrl}
                      alt="Tripbaitullah"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-[#05968f]">Tripbaitullah</h1>
                  <p className="text-xs text-muted-foreground">{siteTagline}</p>
                </div>
              </Link>

              {/* Navigation Menu and Search */}
              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 relative',
                          isActive
                            ? 'text-primary bg-primary/10 font-semibold'
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                {/* Search Button */}
                <Link href="/search" className="p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Main content with bottom padding for mobile navigation */}
      <div className={cn('relative z-10', hideBottomNav ? 'pb-0' : 'pb-16 md:pb-0')}>
        {children}
      </div>
      
      {/* Bottom Navigation - Only visible on mobile */}
      {!hideBottomNav && <BottomNavigation />}
    </div>
  )
}