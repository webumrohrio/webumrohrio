'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { PackageCard } from '@/components/package-card'
import { TravelCard } from '@/components/travel-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  name: string
  address: string
  logo?: string
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  
  const [packages, setPackages] = useState<Package[]>([])
  const [travels, setTravels] = useState<Travel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(queryParam)

  useEffect(() => {
    // Fetch initial data or search results based on query param
    if (queryParam) {
      setSearchQuery(queryParam)
      fetchData(queryParam)
    } else {
      fetchData()
    }
  }, [queryParam])

  const fetchData = async (query?: string) => {
    setLoading(true)
    try {
      // If there's a search query, use search parameter for server-side filtering
      // Otherwise, fetch initial data with reasonable limit
      const searchParam = query ? `search=${encodeURIComponent(query)}` : ''
      const pageSizeParam = query ? 'pageSize=50' : 'pageSize=20' // More results when searching
      const params = [searchParam, pageSizeParam].filter(Boolean).join('&')
      
      const [packagesRes, travelsRes] = await Promise.all([
        fetch(`/api/packages?${params}`),
        fetch('/api/travels')
      ])

      const packagesResult = await packagesRes.json()
      const travelsResult = await travelsRes.json()

      if (packagesResult.success) {
        // Map API data to PackageCard format
        const mappedPackages = packagesResult.data.map((pkg: any) => ({
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
          quota: pkg.quota,
          cashback: pkg.cashback
        }))
        setPackages(mappedPackages)
      }
      if (travelsResult.success) {
        setTravels(travelsResult.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Just update URL, useEffect will handle fetching
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Calculate relevance score for packages
  const calculatePackageRelevance = (pkg: Package, query: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0
    
    // Exact match in package name (highest priority)
    if (pkg.packageName?.toLowerCase() === queryLower) score += 100
    else if (pkg.packageName?.toLowerCase().includes(queryLower)) score += 50
    
    // Match in travel name
    if (pkg.travelName?.toLowerCase().includes(queryLower)) score += 30
    
    // Match in departure city
    if (pkg.departureCity?.toLowerCase().includes(queryLower)) score += 20
    
    // Popularity factors (views, bookings would be ideal, using price as proxy for now)
    // Lower price = more popular (simplified assumption)
    if (pkg.price < 25000000) score += 10
    if (pkg.cashback && pkg.cashback > 0) score += 5
    
    return score
  }

  // Calculate relevance score for travels
  const calculateTravelRelevance = (travel: any, query: string): number => {
    const queryLower = query.toLowerCase().replace('@', '')
    let score = 0
    
    // Exact match in name (highest priority)
    if (travel.name?.toLowerCase() === queryLower) score += 100
    else if (travel.name?.toLowerCase().includes(queryLower)) score += 50
    
    // Match in username
    if (travel.username?.toLowerCase().includes(queryLower)) score += 40
    
    // Match in address/city
    if (travel.address?.toLowerCase().includes(queryLower)) score += 20
    if (travel.city?.toLowerCase().includes(queryLower)) score += 25
    
    // Popularity factors
    if (travel.isVerified) score += 15
    if (travel.rating && travel.rating >= 4.5) score += 10
    if (travel.totalJamaah && travel.totalJamaah > 1000) score += 5
    
    return score
  }

  // No need for client-side filtering since API already filters with search parameter
  // Just sort by relevance and limit results
  const filteredPackages = searchQuery.trim() 
    ? packages
        .map(pkg => ({
          ...pkg,
          relevanceScore: calculatePackageRelevance(pkg, searchQuery)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 20) // Show top 20 most relevant packages
    : []

  const filteredTravels = searchQuery.trim()
    ? travels
        .filter((travel: any) => {
          const searchLower = searchQuery.toLowerCase().replace('@', '')
          return (
            travel.name?.toLowerCase().includes(searchLower) ||
            travel.username?.toLowerCase().includes(searchLower) ||
            travel.address?.toLowerCase().includes(searchLower) ||
            travel.city?.toLowerCase().includes(searchLower)
          )
        })
        .map(travel => ({
          ...travel,
          relevanceScore: calculateTravelRelevance(travel, searchQuery)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10) // Show top 10 most relevant travels
    : []

  return (
    <MobileLayout hideBottomNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">Pencarian</h1>
            </div>
            
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari paket atau travel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Batal
              </Button>
            </div>
          </div>
        </header>

        {/* Results */}
        <main className="container mx-auto max-w-7xl px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          ) : searchQuery.trim() ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Ditemukan {filteredPackages.length} paket dan {filteredTravels.length} travel untuk "{searchQuery}"
                </p>
              </div>

              {/* Packages Results */}
              {filteredPackages.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Paket Umroh ({filteredPackages.length})</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredPackages.map((pkg) => (
                      <PackageCard key={pkg.id} {...pkg} />
                    ))}
                  </div>
                </section>
              )}

              {/* Travels Results */}
              {filteredTravels.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4">Travel Umroh ({filteredTravels.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredTravels.map((travel) => (
                      <TravelCard key={travel.id} {...travel} />
                    ))}
                  </div>
                </section>
              )}

              {filteredPackages.length === 0 && filteredTravels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Tidak ada hasil untuk "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Coba kata kunci lain
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Masukkan kata kunci untuk mencari paket atau travel</p>
            </div>
          )}
        </main>
      </div>
    </MobileLayout>
  )
}


export default function SearchPage() {
  return (
    <Suspense fallback={
      <MobileLayout hideBottomNav>
        <div className="min-h-screen bg-background">
          <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
            <div className="container mx-auto max-w-7xl px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-muted rounded animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          </header>
          <main className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          </main>
        </div>
      </MobileLayout>
    }>
      <SearchContent />
    </Suspense>
  )
}
