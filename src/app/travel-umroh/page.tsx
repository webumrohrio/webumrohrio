'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { TravelListSEO } from '@/components/travel-list-seo'
import { LocationSelector } from '@/components/location-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, PlaneTakeoff, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface Travel {
  id: string
  username: string
  name: string
  description: string
  logo: string
  address: string
  city?: string
  phone: string
  email: string
  website: string
  rating: number
  isVerified?: boolean
}

export default function TravelUmroh() {
  const [travels, setTravels] = useState<Travel[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [preferredLocation, setPreferredLocation] = useState<string>('')
  const observerTarget = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTravels = async (pageNum: number, searchTerm: string = '', isNewSearch: boolean = false, location?: string) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      // Add location filter if available
      const loc = location || preferredLocation
      if (loc && loc !== 'all') {
        params.append('city', loc)
      }

      const response = await fetch(`/api/travels?${params}`)
      const result = await response.json()
      
      if (result.success) {
        if (isNewSearch || pageNum === 1) {
          setTravels(result.data)
        } else {
          setTravels(prev => [...prev, ...result.data])
        }
        setHasMore(result.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch travels:', error)
      toast.error('Gagal memuat data travel')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial load
  useEffect(() => {
    // Load preferred location from localStorage
    const savedLocation = localStorage.getItem('preferredLocation')
    if (savedLocation) {
      setPreferredLocation(savedLocation)
      fetchTravels(1, '', false, savedLocation)
    } else {
      fetchTravels(1, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(search)
      setPage(1)
      fetchTravels(1, search, true)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadingMore])

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchTravels(page, searchQuery)
    }
  }, [page])

  return (
    <MobileLayout>
      <TravelListSEO />
      <div className="min-h-screen bg-background">
        {/* Location Selector - Hide badge, only show popup if no location */}
        <LocationSelector 
          onLocationSelect={(location) => {
            setPreferredLocation(location)
            setPage(1)
            fetchTravels(1, searchQuery, true, location)
          }}
          currentLocation={preferredLocation}
          hideBadge={true}
        />

        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-lg md:text-xl font-bold text-primary">Travel Umroh</h1>
            <p className="text-sm text-muted-foreground">Travel penyelenggara umroh pilihan</p>
          </div>
        </header>

        {/* Search - Sticky */}
        <section className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-md">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari travel umroh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <main className="container mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {loading ? 'Memuat...' : `${travels.length} travel ditemukan`}
            </p>
          </div>

          {/* Travel List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : travels.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {travels.map((travel) => (
                  <Card 
                    key={travel.id} 
                    className="hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer group"
                    onClick={() => window.location.href = `/${travel.username}`}
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="relative">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-all">
                            {travel.logo ? (
                              <Image
                                src={travel.logo}
                                alt={travel.name}
                                width={80}
                                height={80}
                                className="object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <span className="text-2xl md:text-3xl font-bold text-primary">
                                  {travel.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          {travel.isVerified && (
                            <div className="absolute -top-1 -right-1">
                              <svg className="w-6 h-6 text-blue-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
                              {travel.name}
                            </h3>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {travel.description}
                          </p>
                          
                          {(travel.city || travel.address) && (
                            <div className="flex items-start gap-1.5">
                              <PlaneTakeoff className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {travel.city || travel.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Infinite Scroll Trigger & Loading More */}
              <div ref={observerTarget} className="py-8 text-center">
                {loadingMore && (
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Memuat lebih banyak...</span>
                  </div>
                )}
                {!hasMore && !loadingMore && travels.length > 0 && (
                  <p className="text-sm text-gray-500">Semua travel sudah ditampilkan</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">Tidak ada travel yang ditemukan</p>
                {search && (
                  <p className="text-sm text-gray-400">Coba kata kunci lain</p>
                )}
              </div>
              {search && (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Reset Pencarian
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </MobileLayout>
  )
}
