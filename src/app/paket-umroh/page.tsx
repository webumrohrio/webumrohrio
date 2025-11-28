'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { PackageCard } from '@/components/package-card'
import { PackageCardSkeleton } from '@/components/skeleton-card'
import { EmptyState } from '@/components/empty-state'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { LocationSelector } from '@/components/location-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Search, Filter, X } from 'lucide-react'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { debounce } from '@/lib/debounce'
import { toast } from 'sonner'
import { useFilterPersistence } from '@/hooks/useFilterPersistence'

interface Package {
  id: string
  slug?: string
  travelUsername?: string
  image: string
  packageName: string
  travelName: string
  departureDate: string
  departureDateRaw: string
  duration: string
  departureCity: string
  price: number
  originalPrice?: number
  quota?: number
  cashback?: number
  rating?: number
  category: string
  isPinned?: boolean
  pinnedAt?: string
}

export default function PaketUmroh() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [preferredLocation, setPreferredLocation] = useState<string>('')
  
  // Advanced filters
  const [departureMonth, setDepartureMonth] = useState('all')
  const [duration, setDuration] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 100000000])
  
  // Filter persistence
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { saveFilters, loadFilters, clearFilters, saveScrollPosition } = useFilterPersistence()

  // Debounced search handler
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value)
    }, 300),
    []
  )

  // Update debounced search when search changes
  useEffect(() => {
    debouncedSetSearch(search)
  }, [search, debouncedSetSearch])

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    if (savedFilters) {
      setSearch(savedFilters.search || '')
      setSortBy(savedFilters.sortBy || 'default')
      
      // Restore departureMonth and duration
      if (savedFilters.departureMonth) {
        setDepartureMonth(savedFilters.departureMonth)
      }
      if (savedFilters.duration) {
        setDuration(savedFilters.duration)
      }
      
      // Parse price range
      const minPrice = savedFilters.minPrice ? parseInt(savedFilters.minPrice) : 0
      const maxPrice = savedFilters.maxPrice ? parseInt(savedFilters.maxPrice) : 100000000
      setPriceRange([minPrice, maxPrice])
      
      // Restore scroll position after a short delay
      if (savedFilters.scrollPosition !== undefined) {
        setTimeout(() => {
          window.scrollTo(0, savedFilters.scrollPosition || 0)
        }, 100)
      }
    }
    setFiltersLoaded(true)
  }, [loadFilters])

  useEffect(() => {
    // Load preferred location from localStorage
    const savedLocation = localStorage.getItem('preferredLocation')
    if (savedLocation) {
      setPreferredLocation(savedLocation)
      fetchPackages(savedLocation)
    } else {
      fetchPackages()
    }
  }, [])
  
  // Save filters whenever they change (but only after initial load)
  useEffect(() => {
    if (!filtersLoaded) return
    
    const currentFilters = {
      search,
      category: 'all', // Not used in this page
      city: 'all', // Not used in this page
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      sortBy,
      departureMonth,
      duration
    }
    saveFilters(currentFilters)
  }, [search, priceRange, sortBy, departureMonth, duration, filtersLoaded, saveFilters])
  
  // Save scroll position on scroll (throttled)
  useEffect(() => {
    if (!filtersLoaded) return
    
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        saveScrollPosition(window.scrollY)
      }, 500)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [filtersLoaded, saveScrollPosition])

  useEffect(() => {
    if (preferredLocation !== '') {
      fetchPackages(preferredLocation)
    }
  }, [sortBy, preferredLocation])

  const fetchPackages = async (location?: string) => {
    setLoading(true)
    try {
      // Use location parameter or preferredLocation state
      const loc = location || preferredLocation
      const locationParam = loc && loc !== 'all' ? `?location=${loc}` : ''
      const response = await fetch(`/api/packages${locationParam}`)
      const result = await response.json()
      
      if (result.success) {
        let formattedPackages = result.data.map((pkg: any) => ({
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
          cashback: pkg.cashback,
          rating: pkg.rating,
          category: pkg.category,
          isPinned: pkg.isPinned || false,
          pinnedAt: pkg.pinnedAt
        }))

        // Only apply client-side sorting if sortBy is not 'default'
        if (sortBy !== 'default') {
          // Separate pinned and non-pinned packages
          const pinnedPackages = formattedPackages.filter((pkg: any) => pkg.isPinned)
          const nonPinnedPackages = formattedPackages.filter((pkg: any) => !pkg.isPinned)

          // Sort only non-pinned packages based on sortBy
          if (sortBy === 'termurah') {
            nonPinnedPackages.sort((a: Package, b: Package) => a.price - b.price)
          } else if (sortBy === 'termahal') {
            nonPinnedPackages.sort((a: Package, b: Package) => b.price - a.price)
          } else if (sortBy === 'tercepat') {
            nonPinnedPackages.sort((a: Package, b: Package) => {
              const dateA = new Date(a.departureDateRaw).getTime()
              const dateB = new Date(b.departureDateRaw).getTime()
              return dateA - dateB
            })
          }

          // Combine: pinned packages first, then sorted non-pinned packages
          formattedPackages = [...pinnedPackages, ...nonPinnedPackages]
        }
        // If sortBy is 'default', keep the order from API (which already applies algorithm sorting)

        setPackages(formattedPackages)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setSortBy('default')
    setDepartureMonth('all')
    setDuration('all')
    setPriceRange([0, 100000000])
    setIsFilterOpen(false)
    
    // Clear saved filters
    clearFilters()
    
    // Scroll to top
    window.scrollTo(0, 0)
    
    toast.success('Filter direset', {
      description: 'Semua filter telah dihapus'
    })
  }
  
  // Handle refresh
  const handleRefresh = async () => {
    await fetchPackages(preferredLocation)
    toast.success('Data diperbarui!', {
      description: 'Paket umroh telah direfresh'
    })
  }

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return sortBy !== 'default' || 
           departureMonth !== 'all' || 
           duration !== 'all' || 
           priceRange[0] > 0 || 
           priceRange[1] < 100000000
  }, [sortBy, departureMonth, duration, priceRange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (sortBy !== 'default') count++
    if (departureMonth !== 'all') count++
    if (duration !== 'all') count++
    if (priceRange[0] > 0 || priceRange[1] < 100000000) count++
    return count
  }, [sortBy, departureMonth, duration, priceRange])

  // Memoize filtered packages to prevent unnecessary recalculations
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      // Search filter - using debounced search for better performance
      const matchSearch = pkg.packageName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        pkg.travelName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        pkg.departureCity.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      // Departure month filter
      let matchMonth = true
      if (departureMonth !== 'all') {
        const pkgDate = new Date(pkg.departureDateRaw)
        matchMonth = pkgDate.getMonth() === parseInt(departureMonth)
      }
      
      // Duration filter
      let matchDuration = true
      if (duration !== 'all') {
        const days = parseInt(pkg.duration.split(' ')[0])
        if (duration === '7-9') matchDuration = days >= 7 && days <= 9
        else if (duration === '10-12') matchDuration = days >= 10 && days <= 12
        else if (duration === '13+') matchDuration = days >= 13
      }
      
      // Price range filter
      const matchPrice = pkg.price >= priceRange[0] && pkg.price <= priceRange[1]
      
      return matchSearch && matchMonth && matchDuration && matchPrice
    })
  }, [packages, debouncedSearch, departureMonth, duration, priceRange])

  return (
    <MobileLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
        {/* Location Selector - Hide badge, only show popup if no location */}
        <LocationSelector 
          onLocationSelect={(location) => {
            setPreferredLocation(location)
            fetchPackages(location)
          }}
          currentLocation={preferredLocation}
          hideBadge={true}
        />

        {/* Header - Not sticky, will scroll */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 py-3">
            <h1 className="text-lg md:text-xl font-bold text-primary">Paket Umroh</h1>
            <p className="text-sm text-muted-foreground">Temukan paket umroh terbaik</p>
          </div>
        </header>

        {/* Filters - Sticky, stays on top when scrolling */}
        <section className="bg-card/95 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto max-w-7xl">
            <div className="space-y-3">
              {/* Search and Filter */}
              <div className="flex gap-2 md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <Input
                    placeholder="Cari paket umroh..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 md:pl-12 pr-10 h-10 md:h-12"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch('')
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Hapus pencarian"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                </div>

                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant={hasActiveFilters ? "default" : "outline"} 
                      className={`w-[120px] md:w-[140px] h-10 md:h-12 relative ${hasActiveFilters ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="text-sm md:text-base">Filter</span>
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] px-6">
                    <SheetHeader>
                      <SheetTitle className="text-primary">Filter Lanjutan</SheetTitle>
                      <SheetDescription>
                        Sesuaikan pencarian paket umroh Anda
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-6 px-2">
                      {/* Kota Keberangkatan Info */}
                      {preferredLocation && preferredLocation !== 'all' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          <span>Kota Keberangkatan: <span className="font-semibold text-primary">{preferredLocation}</span></span>
                        </div>
                      )}

                      {/* Urutkan */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Urutkan Berdasarkan</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih urutan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="termurah">Termurah</SelectItem>
                            <SelectItem value="termahal">Termahal</SelectItem>
                            <SelectItem value="tercepat">Tercepat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bulan Keberangkatan */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Bulan Keberangkatan</label>
                        <Select value={departureMonth} onValueChange={setDepartureMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bulan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Bulan</SelectItem>
                            <SelectItem value="0">Januari</SelectItem>
                            <SelectItem value="1">Februari</SelectItem>
                            <SelectItem value="2">Maret</SelectItem>
                            <SelectItem value="3">April</SelectItem>
                            <SelectItem value="4">Mei</SelectItem>
                            <SelectItem value="5">Juni</SelectItem>
                            <SelectItem value="6">Juli</SelectItem>
                            <SelectItem value="7">Agustus</SelectItem>
                            <SelectItem value="8">September</SelectItem>
                            <SelectItem value="9">Oktober</SelectItem>
                            <SelectItem value="10">November</SelectItem>
                            <SelectItem value="11">Desember</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Durasi */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Durasi</label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih durasi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Durasi</SelectItem>
                            <SelectItem value="7-9">7-9 Hari</SelectItem>
                            <SelectItem value="10-12">10-12 Hari</SelectItem>
                            <SelectItem value="13+">13+ Hari</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rentang Harga */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Rentang Harga: Rp {priceRange[0].toLocaleString('id-ID')} - Rp {priceRange[1].toLocaleString('id-ID')}
                        </label>
                        <Slider
                          min={0}
                          max={100000000}
                          step={1000000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="mt-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Rp 0</span>
                          <span>Rp 100 Jt</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={resetFilters}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reset Filter
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          Terapkan Filter
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <main className="container mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
          <div className="mb-4 md:mb-6">
            <p className="text-sm md:text-base text-gray-600 font-medium">
              {loading ? 'Memuat...' : `${filteredPackages.length} paket ditemukan`}
            </p>
          </div>

          {/* Package Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <PackageCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="Tidak Ada Paket Ditemukan"
              description="Coba ubah filter atau kata kunci pencarian Anda untuk menemukan paket umroh yang sesuai."
              actionLabel="Reset Filter"
              onAction={resetFilters}
            />
          )}
        </main>
        </div>
      </PullToRefresh>
    </MobileLayout>
  )
}