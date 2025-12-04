'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Plane, PlaneTakeoff, Heart } from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'

interface PackageCardProps {
  id: string
  slug?: string
  travelUsername?: string
  image: string
  packageName: string
  travelName: string
  travelLogo?: string
  travelVerified?: boolean
  departureDate: string
  departureDateRaw?: string
  duration: string
  departureCity: string
  price: number
  originalPrice?: number
  quota?: number
  cashback?: number
}

const PackageCardComponent = ({
  id,
  slug,
  travelUsername,
  image,
  packageName,
  travelName,
  travelLogo,
  travelVerified,
  departureDate,
  departureDateRaw,
  duration,
  departureCity,
  price,
  originalPrice,
  quota,
  cashback
}: PackageCardProps) => {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true)

  // Check if package is favorited on mount
  useEffect(() => {
    checkFavoriteStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const checkFavoriteStatus = async () => {
    try {
      const user = localStorage.getItem('currentUser')
      if (!user) {
        setIsCheckingFavorite(false)
        return
      }

      const userData = JSON.parse(user)
      const response = await fetch(`/api/favorites?email=${encodeURIComponent(userData.email)}`)
      const result = await response.json()
      
      console.log('Favorite check for package', id, ':', result)
      
      if (result.success && result.data) {
        // result.data is an array of package IDs
        const favorited = result.data.includes(id)
        console.log('Is favorited:', favorited)
        setIsFavorited(favorited)
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    } finally {
      setIsCheckingFavorite(false)
    }
  }

  // Calculate departure timing
  const getDepartureTiming = () => {
    if (!departureDateRaw) return null
    
    const now = new Date()
    const departure = new Date(departureDateRaw)
    
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const departureMonth = departure.getMonth()
    const departureYear = departure.getFullYear()
    
    if (departureYear === currentYear && departureMonth === currentMonth) {
      return 'Bulan Ini'
    } else if (
      (departureYear === currentYear && departureMonth === currentMonth + 1) ||
      (currentMonth === 11 && departureYear === currentYear + 1 && departureMonth === 0)
    ) {
      return 'Bulan Depan'
    }
    
    return null
  }

  const departureTiming = getDepartureTiming()

  // Generate URL - prioritize slug-based URL if both slug and travelUsername exist
  const getPackageUrl = () => {
    if (slug && travelUsername) {
      return `/${travelUsername}/paket/${slug}`
    }
    return `/paket-umroh/${id}`
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    router.push(getPackageUrl())
  }

  return (
    <Card 
      className="group cursor-pointer bg-card border border-border hover:border-primary/50 hover:shadow-xl active:scale-[0.98] transition-all duration-300 overflow-hidden rounded-2xl p-0"
      onClick={handleCardClick}
    >
      {/* Image Section - No padding */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Image
          src={image}
          alt={packageName || 'Paket Umroh'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
        />
        {/* Gradient Overlay for better badge visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-10">
          {cashback !== undefined && cashback !== null && cashback > 0 && (
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[10px] md:text-xs font-semibold shadow-lg backdrop-blur-sm border border-orange-400/20 animate-in slide-in-from-right duration-300">
              💰 Cashback {formatCurrency(cashback)}
            </Badge>
          )}
          {departureTiming && (
            <Badge className={`${
              departureTiming === 'Bulan Ini' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400/20' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400/20'
            } text-white text-[10px] md:text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm border animate-in slide-in-from-right duration-300 delay-75`}>
              <Plane className="w-3 h-3" />
              {departureTiming}
            </Badge>
          )}
        </div>
        
        {/* Favorite Heart Icon - Bottom Left (Only show if favorited) */}
        {!isCheckingFavorite && isFavorited && (
          <div
            className="absolute bottom-2 left-2 z-10 w-8 h-8 md:w-9 md:h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border-2 border-red-100 animate-in zoom-in duration-300"
            aria-label="Paket favorit"
          >
            <Heart 
              className="w-4 h-4 md:w-5 md:h-5 fill-red-500 text-red-500 animate-pulse"
            />
          </div>
        )}
      </div>
      
      {/* Content Section - Optimized Spacing */}
      <div className="px-2 pt-1.5 pb-2">
        <div className="space-y-1.5">
          {/* Package Name - +2px */}
          <h3 className="font-bold text-[12px] md:text-[16px] line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
            {packageName}
          </h3>
          
          {/* Travel Name */}
          <div className="flex items-center gap-1 pb-1.5 border-b border-border/50">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all">
              {travelLogo ? (
                <Image
                  src={travelLogo}
                  alt={`Logo ${travelName || 'Travel'}`}
                  width={20}
                  height={20}
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
                />
              ) : (
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(travelName || 'Travel')}&background=10b981&color=fff&size=32&bold=true`}
                  alt={`Logo ${travelName || 'Travel'}`}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              )}
            </div>
            <span className="text-[12px] md:text-[14px] text-primary font-semibold line-clamp-1 flex-1">{travelName}</span>
            {travelVerified && (
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Departure Info - +2px */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-0.5 text-[12px] md:text-[14px] text-muted-foreground flex-1 min-w-0">
              <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary/70" />
              <span className="line-clamp-1 font-medium">{departureDate}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[12px] md:text-[14px] text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary/70" />
              <span className="font-medium">{duration}</span>
            </div>
          </div>
          
          {/* Price and Location - +2px */}
          <div className="flex items-end justify-between gap-1.5">
            <div className="flex items-center gap-0.5 text-[12px] md:text-[14px] text-muted-foreground flex-1 min-w-0">
              <PlaneTakeoff className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary/70" />
              <span className="line-clamp-1 font-medium">{departureCity}</span>
            </div>
            <div className="text-right flex-shrink-0">
              {originalPrice !== undefined && originalPrice !== null && originalPrice > 0 && originalPrice > price && (
                <p className="text-[11px] md:text-[12px] text-muted-foreground line-through leading-tight">
                  {formatCurrency(originalPrice)}
                </p>
              )}
              <p className="text-[14px] md:text-[16px] font-bold text-primary leading-tight">
                {formatCurrency(price)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


// Memoize component to prevent unnecessary re-renders
export const PackageCard = memo(PackageCardComponent)
PackageCard.displayName = 'PackageCard'
