'use client'

import { cn } from '@/lib/utils'
import { Home, PlaneTakeoff, Users, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: PlaneTakeoff, label: 'Paket Umroh', href: '/paket-umroh' },
  { icon: Users, label: 'Travel Umroh', href: '/travel-umroh' },
  { icon: FileText, label: 'Artikel', href: '/artikel' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg active:scale-95 transition-transform duration-150 relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary rounded-full" />
              )}
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}