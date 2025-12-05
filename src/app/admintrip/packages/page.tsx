'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Copy
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

interface Package {
  id: string
  name: string
  description: string
  image: string
  price: number
  duration: string
  departureCity: string
  departureDate: string
  quota: number
  quotaAvailable: number
  cashback?: number
  views: number
  favoriteCount: number
  bookingClicks: number
  travel: {
    id: string
    username: string
    name: string
    rating: number
    isVerified: boolean
    isActive: boolean
  }
  isActive: boolean
  isPinned: boolean
  createdAt: string
}

export default function PackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pinning, setPinning] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortFilter, setSortFilter] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState<'active' | 'departed'>('active')
  const [analytics, setAnalytics] = useState({
    thisMonth: 0,
    nextMonth: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalBookingClicks: 0,
    activePackages: 0,
    inactivePackages: 0,
    departedPackages: 0
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const calculateAnalytics = (packagesData: Package[]) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Count packages departing this month
    const thisMonthCount = packagesData.filter((pkg) => {
      const departureDate = new Date(pkg.departureDate)
      return departureDate.getMonth() === currentMonth && 
             departureDate.getFullYear() === currentYear
    }).length
    
    // Count packages departing next month
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
    const nextMonthCount = packagesData.filter((pkg) => {
      const departureDate = new Date(pkg.departureDate)
      return departureDate.getMonth() === nextMonth && 
             departureDate.getFullYear() === nextMonthYear
    }).length
    
    // Calculate total views, favorites, and booking clicks
    const totalViews = packagesData.reduce((sum, pkg) => sum + (pkg.views || 0), 0)
    const totalFavorites = packagesData.reduce((sum, pkg) => sum + (pkg.favoriteCount || 0), 0)
    const totalBookingClicks = packagesData.reduce((sum, pkg) => sum + (pkg.bookingClicks || 0), 0)
    
    // Count active and inactive packages
    const activePackages = packagesData.filter(pkg => pkg.isActive).length
    const inactivePackages = packagesData.filter(pkg => !pkg.isActive).length
    
    // Count departed packages (departure date has passed)
    const departedPackages = packagesData.filter((pkg) => {
      const departureDate = new Date(pkg.departureDate)
      departureDate.setHours(0, 0, 0, 0)
      return departureDate <= now
    }).length
    
    setAnalytics({
      thisMonth: thisMonthCount,
      nextMonth: nextMonthCount,
      totalViews,
      totalFavorites,
      totalBookingClicks,
      activePackages,
      inactivePackages,
      departedPackages
    })
  }

  const fetchPackages = async () => {
    try {
      // Add includeInactive=true to show all packages including inactive ones
      // Add pageSize=1000 to get all packages (admin dashboard should show all)
      const response = await fetch('/api/packages?includeInactive=true&pageSize=1000')
      const result = await response.json()
      
      console.log('📦 Total packages from API:', result.data?.length)
      console.log('📦 DNT packages:', result.data?.filter((p: any) => p.travel.username === 'dnt').length)
      
      if (result.success) {
        // Auto-deactivate packages with past departure dates
        const now = new Date()
        const packagesWithStatus = result.data.map((pkg: Package) => {
          const departureDate = new Date(pkg.departureDate)
          const isPast = departureDate < now
          
          // If departure date has passed and package is still active, deactivate it
          if (isPast && pkg.isActive) {
            // Update in background without blocking UI
            fetch(`/api/packages/${pkg.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...pkg, isActive: false })
            }).catch(err => console.error('Failed to auto-deactivate package:', err))
            
            return { ...pkg, isActive: false }
          }
          
          return pkg
        })
        
        setPackages(packagesWithStatus)
        calculateAnalytics(packagesWithStatus)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ Yakin ingin menghapus paket "${name}"?\n\nData yang dihapus tidak dapat dikembalikan!`)) {
      return
    }

    setDeleting(id)
    
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Paket berhasil dihapus!')
        // Refresh data
        fetchPackages()
      } else {
        alert('❌ Gagal menghapus paket: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('❌ Terjadi kesalahan saat menghapus paket')
    } finally {
      setDeleting(null)
    }
  }

  const handleDuplicate = async (id: string, name: string, travelId: string) => {
    if (!confirm(`📋 Duplikat paket "${name}"?\n\nSemua data akan di-copy. Anda bisa edit tanggal dan detail lainnya setelah duplikasi.`)) {
      return
    }

    setDuplicating(id)
    
    try {
      const response = await fetch('/api/admintrip/packages/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: id, travelId })
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Paket berhasil diduplikasi!\n\nAnda akan diarahkan ke halaman edit untuk mengubah tanggal dan detail lainnya.')
        // Redirect to edit page of duplicated package
        router.push(`/admintrip/packages/edit/${result.data.id}`)
      } else {
        alert('❌ Gagal menduplikasi paket: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Duplicate error:', error)
      alert('❌ Terjadi kesalahan saat menduplikasi paket')
    } finally {
      setDuplicating(null)
    }
  }

  const handleTogglePin = async (id: string, currentPinStatus: boolean, name: string) => {
    setPinning(id)
    
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinStatus })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh data without alert
        fetchPackages()
      } else {
        // Only show alert on error
        alert('❌ Gagal mengubah status pin')
      }
    } catch (error) {
      console.error('Pin error:', error)
      alert('❌ Terjadi kesalahan')
    } finally {
      setPinning(null)
    }
  }

  // Get unique cities
  const uniqueCities = Array.from(new Set(packages.map(pkg => pkg.departureCity))).sort()

  // Helper function to calculate popularity score
  const getPopularityScore = (pkg: Package) => {
    return (pkg.views || 0) + 
           (pkg.favoriteCount || 0) * 2 + 
           (pkg.bookingClicks || 0) * 3
  }

  const filteredPackages = packages
    .filter(pkg => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const departureDate = new Date(pkg.departureDate)
      departureDate.setHours(0, 0, 0, 0)
      const hasDeparted = departureDate <= now
      
      // Filter by tab
      const matchTab = activeTab === 'active' ? !hasDeparted : hasDeparted
      
      const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.travel.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.travel.username.toLowerCase().includes(search.toLowerCase()) ||
        pkg.departureCity.toLowerCase().includes(search.toLowerCase())
      
      const matchCity = cityFilter === 'all' || pkg.departureCity === cityFilter
      
      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && pkg.isActive) ||
        (statusFilter === 'inactive' && !pkg.isActive)
      
      return matchTab && matchSearch && matchCity && matchStatus
    })
    .sort((a, b) => {
      // Sort based on selected filter
      if (sortFilter === 'popular') {
        return getPopularityScore(b) - getPopularityScore(a)
      } else { // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Pagination
  const totalPackages = filteredPackages.length
  const totalPages = Math.ceil(totalPackages / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex)

  // Reset to page 1 when filters or items per page change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, cityFilter, statusFilter, sortFilter, itemsPerPage, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Paket Umroh</h1>
          <p className="text-gray-600">Kelola data paket umroh</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => router.push('/admintrip/packages/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Paket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Paket</p>
          <p className="text-2xl font-bold text-gray-800">{packages.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Tidak Aktif</p>
          <p className="text-2xl font-bold text-gray-500">{analytics.inactivePackages}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Dilihat</p>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Favorit</p>
          <p className="text-2xl font-bold text-red-600">{analytics.totalFavorites.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Paket di Pilih</p>
          <p className="text-2xl font-bold text-orange-600">{analytics.totalBookingClicks.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Bulan Ini</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.thisMonth}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Bulan Depan</p>
          <p className="text-2xl font-bold text-teal-600">{analytics.nextMonth}</p>
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
            {analytics.departedPackages}
          </span>
        </button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Cari paket, nama travel, atau username travel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg min-w-[150px]"
          >
            <option value="newest">Terbaru</option>
            <option value="popular">Terpopuler</option>
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg min-w-[200px]"
          >
            <option value="all">Semua Kota</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg min-w-[150px]"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Favorit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keberangkatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedPackages.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data paket
                  </td>
                </tr>
              ) : (
                paginatedPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{startIndex + index + 1}</span>
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
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-primary font-medium">{pkg.travel.name}</span>
                          {pkg.travel.isVerified && (
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">@{pkg.travel.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(pkg.price)}</div>
                      {pkg.cashback && (
                        <div className="text-xs text-orange-600">Cashback {formatCurrency(pkg.cashback)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-600">{pkg.views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{pkg.favoriteCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">{pkg.bookingClicks.toLocaleString()}</span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!pkg.travel.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Travel Tidak Aktif
                        </span>
                      ) : pkg.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={pkg.isPinned ? 'text-primary hover:text-primary hover:bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-primary/10'}
                          onClick={() => handleTogglePin(pkg.id, pkg.isPinned, pkg.name)}
                          disabled={pinning === pkg.id}
                          title={pkg.isPinned ? 'Unpin paket' : 'Pin paket ke atas'}
                        >
                          {pinning === pkg.id ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Pin className={`w-4 h-4 ${pkg.isPinned ? 'fill-primary' : ''}`} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/paket-umroh/${pkg.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleDuplicate(pkg.id, pkg.name, pkg.travel.id)}
                          disabled={duplicating === pkg.id}
                          title="Duplikat Paket"
                        >
                          {duplicating === pkg.id ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admintrip/packages/edit/${pkg.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={deleting === pkg.id}
                        >
                          {deleting === pkg.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPackages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, totalPackages)}</span> dari <span className="font-medium">{totalPackages}</span> paket
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Tampilkan:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
            </div>
            {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
