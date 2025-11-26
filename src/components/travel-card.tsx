'use client'

import { Card } from '@/components/ui/card'
import { PlaneTakeoff, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { memo } from 'react'

interface TravelCardProps {
  id: string
  name: string
  username?: string
  address: string
  city?: string
  logo?: string
  isVerified?: boolean
}

const TravelCardComponent = ({ id, name, username, address, city, logo, isVerified }: TravelCardProps) => {
  const router = useRouter()
  // Use username from database, or generate from name as fallback
  const travelUsername = username || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    router.push(`/${travelUsername}`)
  }
  
  return (
    <Card 
      className="group cursor-pointer bg-card border border-border hover:border-primary/50 hover:shadow-2xl active:scale-[0.98] transition-all duration-300 overflow-hidden rounded-2xl"
      onClick={handleCardClick}
    >
      <div className="p-2.5 md:p-3">
        <div className="flex items-center gap-2.5">
          {/* Logo Travel */}
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              {logo ? (
                <Image
                  src={logo}
                  alt={name}
                  width={64}
                  height={64}
                  className="object-cover rounded-lg w-full h-full"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                  <span className="text-xl md:text-2xl font-bold text-primary">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Verified Badge - Shield Style */}
            {isVerified && (
              <div className="absolute -top-1 -right-1 animate-in zoom-in duration-300">
                <div className="relative">
                  <svg className="w-6 h-6 text-blue-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-40 animate-pulse" />
                </div>
              </div>
            )}
          </div>
          
          {/* Info Travel */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
            
            {/* Departure City */}
            <div className="flex items-center gap-1">
              <PlaneTakeoff className="w-3 h-3 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                {city || address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


// Memoize component to prevent unnecessary re-renders
export const TravelCard = memo(TravelCardComponent)
TravelCard.displayName = 'TravelCard'
