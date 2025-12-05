'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { HomepageSEO } from '@/components/homepage-seo'
import { ImageSlider } from '@/components/image-slider'
import { PackageCard } from '@/components/package-card'
import { TravelCard } from '@/components/travel-card'
import { ArticleCard } from '@/components/article-card'
import { PackageCardSkeleton, TravelCardSkeleton, ArticleCardSkeleton } from '@/components/skeleton-card'
import { VideoCardSkeleton } from '@/components/video-card-skeleton'
import { EmptyState } from '@/components/empty-state'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { LocationSelector } from '@/components/location-selector'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ArrowRight, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Package {
  id: string
  slug?: string
  travelUsername?: string
  image: string
  packageName: string
  travelName: string
  travelLogo?: string
  travelVerified?: boolean
  departureDate: string
  departureDateRaw: string
  duration: string
  departureCity: string
  price: number
  originalPrice?: number
  quota?: number
  cashback?: number
}

interface Travel {
  id: string
  username: string
  name: string
  address: string
  city?: string
  logo?: string
  isVerified?: boolean
}

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  image: string
  createdAt: string
  tags: string
}

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  videoId: string
  thumbnail: string
  isActive: boolean
}

export default function Home() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [travels, setTravels] = useState<Travel[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTravels, setLoadingTravels] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [bulanIni, setBulanIni] = useState(0)
  const [bulanDepan, setBulanDepan] = useState(0)
  const [totalPaket, setTotalPaket] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [showFullscreenHint, setShowFullscreenHint] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [siteTagline, setSiteTagline] = useState('Smart Way to Go Baitullah')
  const [preferredLocation, setPreferredLocation] = useState<string>('')
  
  // Homepage settings
  const [packageCount, setPackageCount] = useState(6)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [showPromo, setShowPromo] = useState(true)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Helper to get display count based on screen size
  const getDisplayCount = () => {
    return isDesktop ? 8 : packageCount
  }
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const wasDesktop = isDesktop
      const nowDesktop = window.innerWidth >= 1024
      setIsDesktop(nowDesktop)
      
      // Re-fetch packages if screen size category changed
      if (wasDesktop !== nowDesktop && settingsLoaded) {
        fetchPackages(preferredLocation)
      }
    }
    
    // Initial check
    checkScreenSize()
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isDesktop, settingsLoaded, preferredLocation])

  useEffect(() => {
    // Load preferred location from localStorage first
    const savedLocation = localStorage.getItem('preferredLocation')
    if (savedLocation) {
      setPreferredLocation(savedLocation)
    }
    
    fetchHomepageSettings()
    fetchLogo()
    fetchTagline()
    fetchAnalytics(savedLocation || '')
  }, [])
  
  // Fetch data after settings loaded and screen size detected
  useEffect(() => {
    if (settingsLoaded) {
      fetchPackages(preferredLocation)
      fetchTravels(preferredLocation)
      fetchArticles()
      fetchVideos(preferredLocation)
    }
  }, [settingsLoaded, isDesktop])

  // Show fullscreen hint when video opens
  useEffect(() => {
    if (isVideoOpen) {
      // Show hint after 1 second
      const timer = setTimeout(() => {
        setShowFullscreenHint(true)
      }, 1000)

      // Hide hint after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowFullscreenHint(false)
      }, 6000)

      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    } else {
      setShowFullscreenHint(false)
    }
  }, [isVideoOpen])

  const animateCounter = (setter: (value: number) => void, target: number, duration: number = 2000) => {
    const steps = 60
    const increment = target / steps
    const stepDuration = duration / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setter(target)
        clearInterval(timer)
      } else {
        setter(Math.floor(current))
      }
    }, stepDuration)
    
    return timer
  }

  const fetchAnalytics = async (location: string = '') => {
    try {
      const locationParam = location && location !== 'all' ? `&location=${location}` : ''
      const response = await fetch(`/api/packages?${locationParam}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        // Count packages departing this month
        const thisMonthCount = result.data.filter((pkg: any) => {
          const departureDate = new Date(pkg.departureDate)
          return departureDate.getMonth() === currentMonth && 
                 departureDate.getFullYear() === currentYear
        }).length
        
        // Count packages departing next month
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
        const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
        const nextMonthCount = result.data.filter((pkg: any) => {
          const departureDate = new Date(pkg.departureDate)
          return departureDate.getMonth() === nextMonth && 
                 departureDate.getFullYear() === nextMonthYear
        }).length
        
        // Total packages
        const totalCount = result.data.length
        
        // Animate counters with real data
        const timer1 = animateCounter(setBulanIni, thisMonthCount, 2000)
        const timer2 = animateCounter(setBulanDepan, nextMonthCount, 2000)
        const timer3 = animateCounter(setTotalPaket, totalCount, 2000)
        
        return () => {
          clearInterval(timer1)
          clearInterval(timer2)
          clearInterval(timer3)
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const fetchPackages = async (location: string = '') => {
    try {
      const locationParam = location && location !== 'all' ? `&location=${location}` : ''
      // Desktop always shows 8, mobile/tablet uses admin setting
      const limit = getDisplayCount()
      const response = await fetch(`/api/packages?limit=${limit}${locationParam}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      console.log('Response text:', text)
      
      if (!text) {
        throw new Error('Empty response from server')
      }
      
      const result = JSON.parse(text)
      
      if (result.success && result.data) {
        const formattedPackages = result.data
          .filter((pkg: any) => pkg.travel.isVerified) // Only show verified travel packages
          .map((pkg: any) => ({
            id: pkg.id,
            slug: pkg.slug,
            travelUsername: pkg.travel.username,
            image: pkg.image,
            packageName: pkg.name,
            travelName: pkg.travel.name,
            travelLogo: pkg.travel.logo || null,
            travelVerified: pkg.travel.isVerified || false,
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
        setPackages(formattedPackages)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTravels = async (location: string = '') => {
    try {
      const locationParam = location && location !== 'all' ? `&location=${location}` : ''
      const response = await fetch(`/api/travels?limit=6${locationParam}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setTravels(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch travels:', error)
    } finally {
      setLoadingTravels(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=4')
      const result = await response.json()
      
      if (result.success && result.data) {
        setArticles(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  const fetchVideos = async (location: string = '') => {
    try {
      const locationParam = location && location !== 'all' ? `?location=${location}` : ''
      const response = await fetch(`/api/videos${locationParam}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter only active videos and limit to 6
        const activeVideos = result.data.filter((v: Video) => v.isActive).slice(0, 6)
        setVideos(activeVideos)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoadingVideos(false)
    }
  }

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/settings?key=siteLogo')
      
      if (!response.ok) {
        console.warn('Failed to fetch logo, using default')
        return
      }
      
      const result = await response.json()
      
      if (result.success && result.data && result.data.value) {
        setLogoUrl(result.data.value)
      }
    } catch (error) {
      // Silently fail - logo is not critical for app functionality
      console.warn('Error fetching logo, using default:', error)
    }
  }

  const fetchTagline = async () => {
    try {
      const response = await fetch('/api/settings?key=siteTagline')
      
      if (!response.ok) {
        console.warn('Failed to fetch tagline, using default')
        return
      }
      
      const result = await response.json()
      
      if (result.success && result.data && result.data.value) {
        setSiteTagline(result.data.value)
      }
    } catch (error) {
      // Silently fail - tagline is not critical for app functionality
      console.warn('Error fetching tagline, using default:', error)
    }
  }

  const fetchHomepageSettings = async () => {
    try {
      const [countRes, analyticsRes, promoRes] = await Promise.all([
        fetch('/api/settings?key=homePackageCount'),
        fetch('/api/settings?key=showAnalytics'),
        fetch('/api/settings?key=showPromo')
      ])

      // Check if responses are ok before parsing
      if (countRes.ok) {
        const countData = await countRes.json()
        if (countData.success && countData.data) {
          setPackageCount(parseInt(countData.data.value))
        }
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        if (analyticsData.success && analyticsData.data) {
          setShowAnalytics(analyticsData.data.value === 'true')
        }
      }
      
      if (promoRes.ok) {
        const promoData = await promoRes.json()
        if (promoData.success && promoData.data) {
          setShowPromo(promoData.data.value === 'true')
        }
      }
    } catch (error) {
      // Silently fail - use default settings
      console.warn('Failed to fetch homepage settings, using defaults:', error)
    } finally {
      setSettingsLoaded(true)
    }
  }

  const handleLocationSelect = (location: string) => {
    setPreferredLocation(location)
    // Refresh data with new location
    fetchPackages(location)
    fetchTravels(location)
    fetchVideos(location)
    fetchAnalytics(location)
    
    toast.success('Lokasi diperbarui!', {
      description: `Kota Keberangkatan dari ${location === 'all' ? 'semua kota' : location}`
    })
    
    // TODO: If user is logged in, save to database
    // For now, it's saved in localStorage by LocationSelector component
  }
  
  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([
      fetchPackages(preferredLocation),
      fetchTravels(preferredLocation),
      fetchArticles(),
      fetchVideos(preferredLocation),
      fetchAnalytics(preferredLocation)
    ])
    toast.success('Data diperbarui!', {
      description: 'Semua data telah direfresh'
    })
  }

  return (
    <MobileLayout>
      <HomepageSEO />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-[#f7f9fa]">
        {/* Mobile Header - Sticky with blur effect */}
        <header className="md:hidden bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <div className="h-10 flex items-center flex-shrink-0">
                    <img
                      src={logoUrl}
                      alt="Tripbaitullah"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-[18px] font-bold text-[#05968f]">
                    Tripbaitullah
                  </h1>
                  <p className="text-xs text-muted-foreground">{siteTagline}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/search')}
                className="flex-shrink-0 border-primary bg-primary/5 hover:bg-primary/10 shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-primary font-medium">Cari...</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-4 md:pb-8">
          {/* Location Selector Badge */}
          <LocationSelector 
            onLocationSelect={handleLocationSelect}
            currentLocation={preferredLocation}
          />
          
          {/* Hero Slider */}
          <section className="px-3 pt-4 md:px-6 md:pt-6">
            <div className="max-w-7xl mx-auto">
              <ImageSlider />
            </div>
          </section>
          
          {/* Content sections */}
          <div className="px-3 md:px-6 space-y-8 mt-6 max-w-7xl mx-auto">

            {/* Quick Stats - Modern Cards */}
            {settingsLoaded && showAnalytics && (
            <section>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <button 
                  onClick={() => window.location.href = '/paket-umroh?filter=bulan-ini'}
                  className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-2xl p-3 md:p-5 text-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">
                    {bulanIni}+
                  </div>
                  <div className="text-[10px] md:text-sm text-green-700 dark:text-green-300 font-medium leading-tight">
                    Berangkat<br className="md:hidden" /> Bulan Ini
                  </div>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/paket-umroh?filter=bulan-depan'}
                  className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 md:p-5 text-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
                    {bulanDepan}+
                  </div>
                  <div className="text-[10px] md:text-sm text-blue-700 dark:text-blue-300 font-medium leading-tight">
                    Berangkat<br className="md:hidden" /> Bulan Depan
                  </div>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/paket-umroh'}
                  className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-3 md:p-5 text-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                    {totalPaket}+
                  </div>
                  <div className="text-[10px] md:text-sm text-primary/80 font-medium leading-tight">
                    Total Paket<br className="md:hidden" /> Tersedia
                  </div>
                </button>
              </div>
            </section>
            )}

            {/* Cashback Info Banner - Modern Design */}
            {settingsLoaded && showPromo && (
            <section>
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
                </div>
                
                <div className="relative z-10 flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 md:w-8 md:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs font-semibold text-white">
                        PROMO
                      </span>
                    </div>
                    <h3 className="text-base md:text-xl font-bold text-white mb-0.5 leading-tight">
                      Cashback hingga Rp 2 Juta
                    </h3>
                    <p className="text-xs md:text-sm text-white/90 leading-tight">
                      Untuk setiap pemesanan paket umroh melalui Tripbaitullah
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Featured Packages */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">Paket Umroh Pilihan</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Paket terbaik untuk ibadah Anda</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 -mr-2"
                  onClick={() => router.push('/paket-umroh')}
                >
                  <span className="text-xs md:text-sm">Semua</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </Button>
              </div>

              {/* Package Grid - Responsive */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(getDisplayCount())].map((_, index) => (
                    <PackageCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {packages.slice(0, getDisplayCount()).map((pkg) => (
                    <PackageCard key={pkg.id} {...pkg} />
                  ))}
                </div>
              )}
            </section>

            {/* Travel Umroh Pilihan */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">Travel Pilihan</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Mitra resmi dengan layanan terbaik</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 -mr-2"
                  onClick={() => router.push('/travel-umroh')}
                >
                  <span className="text-xs md:text-sm">Semua</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </Button>
              </div>

              {loadingTravels ? (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="flex gap-3 pb-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="flex-shrink-0 w-[260px] md:w-[300px]">
                        <TravelCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
                  <div className="flex gap-3 pb-2">
                    {travels.map((travel) => (
                      <div key={travel.id} className="flex-shrink-0 w-[260px] md:w-[300px]">
                        <TravelCard {...travel} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Video Section */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">Video</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Informasi dan Inspirasi seputar ibadah umroh</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 -mr-2"
                  onClick={() => router.push('/videos')}
                >
                  <span className="text-xs md:text-sm">Semua</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </Button>
              </div>

              {loadingVideos ? (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="flex gap-3 pb-2">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex-shrink-0 w-[calc(50%-6px)] md:w-[320px]">
                        <VideoCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : videos.length > 0 ? (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
                  <div className="flex gap-3 pb-2">
                    {videos.map((video) => (
                      <div key={video.id} className="flex-shrink-0 w-[calc(50%-6px)] md:w-[320px] snap-start">
                        <div 
                          className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedVideo(video)
                            setIsVideoOpen(true)
                          }}
                        >
                          <div className="relative aspect-video bg-gray-900">
                            <img
                              src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">Belum ada video tersedia</p>
                </div>
              )}
            </section>

            {/* Video Popup Dialog */}
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0">
                <DialogTitle className="sr-only">
                  {selectedVideo?.title || 'Video Player'}
                </DialogTitle>
                <div className="relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsVideoOpen(false)}
                    className="absolute -top-12 right-0 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Video Player */}
                  {selectedVideo && (
                    <div className="relative aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&fs=1&color=white`}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {/* Fullscreen Hint - Below Video */}
                  {showFullscreenHint && selectedVideo && (
                    <div className="bg-gray-900 px-4 py-3 border-t border-gray-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="text-sm font-medium text-white">Klik icon fullscreen untuk pengalaman terbaik</span>
                        </div>
                        <button
                          onClick={() => setShowFullscreenHint(false)}
                          className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Info */}
                  {selectedVideo && (
                    <div className="bg-gray-900 p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                        {selectedVideo.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-300">
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Artikel Pilihan */}
            <section className="pb-2">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">Artikel & Tips</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Panduan lengkap ibadah umroh</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 -mr-2"
                  onClick={() => router.push('/artikel')}
                >
                  <span className="text-xs md:text-sm">Semua</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </Button>
              </div>

              {loadingArticles ? (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div className="flex gap-3 pb-2">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex-shrink-0 w-[calc(50%-6px)] md:w-[320px]">
                        <ArticleCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
                  <div className="flex gap-3 pb-2">
                    {articles.map((article) => (
                      <div key={article.id} className="flex-shrink-0 w-[calc(50%-6px)] md:w-[320px] snap-start">
                        <ArticleCard 
                          {...article}
                          date={new Date(article.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                          readTime="5 menit"
                          category={article.tags.split(',')[0]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
        </div>
      </PullToRefresh>
    </MobileLayout>
  )
}