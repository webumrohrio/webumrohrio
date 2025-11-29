'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Package {
  id: string
  slug: string
  name: string
  image: string
  price: number
  duration: string
  departureCity: string
  departureDate: string
  views: number
  favoriteCount: number
  bookingClicks: number
  cashback?: number
  isActive: boolean
}

export default function TravelPackagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [travelSession, setTravelSession] = useState<any>(null)
  const [travelInfo, setTravelInfo] = useState<{ isActive: boolean } | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'departed'>('active')

  // Show success/error feedback from URL params
  useEffect(() => {
    const status = searchParams.get('status')
    const action = searchParams.get('action')
    
    if (status === 'success' && action === 'created') {
      toast.success('Paket Berhasil Ditambahkan! 🎉', {
        description: 'Paket umroh baru telah berhasil ditambahkan ke daftar Anda.',
        duration: 5000,
      })
      // Clean URL
      router.replace('/travel-admin/packages')
    } else if (status === 'success' && action === 'updated') {
      toast.success('Paket Berhasil Diperbarui! ✅', {
        description: 'Perubahan pada paket umroh telah berhasil disimpan.',
        duration: 5000,
      })
      // Clean URL
      router.replace('/travel-admin/packages')
    } else if (status === 'error') {
      const message = searchParams.get('message') || 'Terjadi kesalahan'
      toast.error('Gagal Menyimpan Paket ❌', {
        description: message,
        duration: 5000,
      })
      // Clean URL
      router.replace('/travel-admin/packages')
    }
  }, [searchParams, router])

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        console.log('🔍 Travel Session:', parsed)
        
        if (!parsed.username) {
          console.error('❌ Username not found in session!')
          alert('Session tidak valid. Silakan login kembali.')
          router.push('/travel-admin/login')
          return
        }
        
        console.log('📦 Fetching packages for username:', parsed.username)
        setTravelSession(parsed)
        fetchPackages(parsed.username)
        fetchTravelInfo(parsed.username)
      } catch (error) {
        console.error('❌ Error parsing session:', error)
        router.push('/travel-admin/login')
      }
    } else {
      console.log('⚠️ No travel session found!')
      router.push('/travel-admin/login')
    }
  }, [router])

  const fetchPackages = async (username: string) => {
    try {
      // Include inactive packages for travel admin to see all their packages
      const url = `/api/packages?username=${username}&includeInactive=true`
      console.log('🌐 Fetching from:', url)
      
      const response = await fetch(url)
      const result = await response.json()

      console.log('📊 API Response:', result)
      console.log('📦 Packages count:', result.data?.length || 0)

      if (result.success) {
        // Verify all packages belong to this travel
        const allBelongToTravel = result.data.every((pkg: any) => 
          pkg.travel.username === username
        )
        
        if (!allBelongToTravel) {
          console.error('⚠️ WARNING: Some packages do not belong to this travel!')
          result.data.forEach((pkg: any) => {
            if (pkg.travel.username !== username) {
              console.error(`❌ Package "${pkg.name}" belongs to ${pkg.travel.username}`)
            }
          })
        } else {
          console.log('✅ All packages verified to belong to this travel')
        }
        
        setPackages(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTravelInfo = async (username: string) => {
    try {
      const response = await fetch(`/api/travel-admin/profile?username=${username}`)
      const result = await response.json()
      if (result.success && result.data) {
        setTravelInfo({ isActive: result.data.isActive })
      }
    } catch (error) {
      console.error('Failed to fetch travel info:', error)
    }
  }

  // Delete functionality removed - only Super Admin can delete packages
  // Travel Admin cannot delete packages to maintain permanent quota system

  const filteredPackages = packages.filter(pkg => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const departureDate = new Date(pkg.departureDate)
    departureDate.setHours(0, 0, 0, 0)
    const hasDeparted = departureDate < now
    
    // Filter by tab
    const matchTab = activeTab === 'active' ? !hasDeparted : hasDeparted
    
    const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.departureCity.toLowerCase().includes(search.toLowerCase())
    
    return matchTab && matchSearch
  })

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const departedPackages = packages.filter(pkg => {
    const departureDate = new Date(pkg.departureDate)
    departureDate.setHours(0, 0, 0, 0)
    return departureDate < now
  })

  const stats = {
    total: packages.length,
    totalViews: packages.reduce((sum, pkg) => sum + pkg.views, 0),
    totalFavorites: packages.reduce((sum, pkg) => sum + pkg.favoriteCount, 0),
    totalBookingClicks: packages.reduce((sum, pkg) => sum + pkg.bookingClicks, 0),
    departedCount: departedPackages.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Paket Umroh</h1>
          {travelInfo && (
            travelInfo.isActive ? (
              <Badge className="bg-green-500 text-white px-3 py-1">
                ✓ Aktif
              </Badge>
            ) : (
              <Badge className="bg-orange-500 text-white px-3 py-1">
                ⚠ Tidak Aktif
              </Badge>
            )
          )}
        </div>
        <p className="text-gray-600 mt-1">Kelola paket umroh Anda</p>
      </div>

      {/* Warning if travel is inactive */}
      {travelInfo && !travelInfo.isActive && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">Travel Anda Tidak Aktif</h3>
              <p className="text-sm text-orange-800">
                Semua paket Anda tidak akan ditampilkan kepada pengguna karena status travel tidak aktif. 
                Ubah Status Travel Anda di Halaman Profile Travel.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => router.push('/travel-admin/profile')}
              >
                Ke Halaman Profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Paket</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Dilihat</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Favorit</p>
          <p className="text-2xl font-bold text-red-600">{stats.totalFavorites.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Klik Booking</p>
          <p className="text-2xl font-bold text-orange-600">{stats.totalBookingClicks.toLocaleString()}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Paket Aktif
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-semibold">
            {packages.filter(pkg => {
              const now = new Date()
              now.setHours(0, 0, 0, 0)
              const departureDate = new Date(pkg.departureDate)
              departureDate.setHours(0, 0, 0, 0)
              return departureDate >= now
            }).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('departed')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'departed'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sudah Berangkat
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600 font-semibold">
            {stats.departedCount}
          </span>
        </button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Cari paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Favorit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keberangkatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    {search ? 'Tidak ada paket yang cocok' : 'Belum ada paket'}
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={pkg.image}
                            alt={pkg.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-sm text-gray-500">{pkg.duration} • {pkg.departureCity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(pkg.price)}</div>
                      {pkg.cashback && (
                        <div className="text-xs text-orange-600">Cashback {formatCurrency(pkg.cashback)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!travelInfo?.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Travel Tidak Aktif
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-600">{pkg.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{pkg.favoriteCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">{pkg.bookingClicks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(pkg.departureDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        {new Date(pkg.departureDate) < new Date() && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                            Sudah Berangkat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(pkg.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(pkg.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          onClick={() => {
                            // Get travel username from session
                            const session = localStorage.getItem('travelAdminSession')
                            if (session) {
                              const parsed = JSON.parse(session)
                              window.open(`/${parsed.username}/paket/${pkg.slug}`, '_blank')
                            }
                          }}
                          title="Lihat Paket"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => router.push(`/travel-admin/packages/edit/${pkg.id}`)}
                          title="Edit Paket"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Action Button - Tambah Paket */}
      <button
        onClick={() => router.push('/travel-admin/packages/create')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group hover:scale-110 active:scale-95"
        aria-label="Tambah Paket"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  )
}
