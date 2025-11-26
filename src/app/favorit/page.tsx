'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { PackageCard } from '@/components/package-card'
import { PackageCardSkeleton } from '@/components/skeleton-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Package {
  id: string
  slug?: string
  travelUsername?: string
  image: string
  packageName: string
  travelName: string
  travelLogo?: string | null
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

export default function FavoritPage() {
  const router = useRouter()
  const [favoritePackages, setFavoritePackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
    
    // Reload when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFavorites()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', loadFavorites)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', loadFavorites)
    }
  }, [])

  const loadFavorites = async () => {
    try {
      // Get user
      const user = localStorage.getItem('currentUser')
      if (!user) {
        router.push('/login')
        return
      }

      const userData = JSON.parse(user)

      // Fetch favorites from database
      const favResponse = await fetch(`/api/favorites?email=${encodeURIComponent(userData.email)}`)
      const favResult = await favResponse.json()

      if (!favResult.success || favResult.data.length === 0) {
        setLoading(false)
        return
      }

      const favorites = favResult.data

      // Fetch all packages
      const response = await fetch('/api/packages')
      const result = await response.json()

      // Filter packages that are in favorites
      const packages = result.data || result.packages || []
      const favoritePackagesList = packages
        .filter((pkg: any) => favorites.includes(pkg.id))
        .map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          travelUsername: pkg.travel?.username,
          image: pkg.image,
          packageName: pkg.name,
          travelName: pkg.travel?.name || '',
          travelLogo: pkg.travel?.logo || null,
          travelVerified: pkg.travel?.isVerified || false,
          departureDate: new Date(pkg.departureDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          departureDateRaw: pkg.departureDate,
          duration: pkg.duration,
          departureCity: pkg.departureCity,
          price: pkg.price,
          originalPrice: pkg.originalPrice,
          quota: pkg.quotaAvailable,
          cashback: pkg.cashback
        }))

      setFavoritePackages(favoritePackagesList)
      setLoading(false)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setLoading(false)
    }
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary">Paket Favorit</h1>
              <p className="text-xs text-muted-foreground">
                {favoritePackages.length} paket tersimpan
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[...Array(6)].map((_, index) => (
                <PackageCardSkeleton key={index} />
              ))}
            </div>
          ) : favoritePackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Favorit</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Anda belum menambahkan paket umroh ke favorit. Mulai jelajahi dan simpan paket favorit Anda!
              </p>
              <Button onClick={() => router.push('/paket-umroh')}>
                Jelajahi Paket Umroh
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {favoritePackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  id={pkg.id}
                  slug={pkg.slug}
                  travelUsername={pkg.travelUsername}
                  image={pkg.image}
                  packageName={pkg.packageName}
                  travelName={pkg.travelName}
                  travelLogo={pkg.travelLogo || undefined}
                  travelVerified={pkg.travelVerified}
                  departureDate={pkg.departureDate}
                  departureDateRaw={pkg.departureDateRaw}
                  duration={pkg.duration}
                  departureCity={pkg.departureCity}
                  price={pkg.price}
                  originalPrice={pkg.originalPrice}
                  quota={pkg.quota}
                  cashback={pkg.cashback}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
