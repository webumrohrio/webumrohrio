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
  Filter,
  RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  isActive: boolean
  isVerified?: boolean
  packageLimit?: number
  packageUsed?: number
  _count?: {
    packages: number
  }
}

export default function TravelsPage() {
  const router = useRouter()
  const [travels, setTravels] = useState<Travel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchTravels()
  }, [])

  const fetchTravels = async () => {
    try {
      const response = await fetch('/api/travels?showAll=true')
      const result = await response.json()
      
      if (result.success) {
        setTravels(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch travels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus travel "${name}"?\n\nPeringatan: Travel yang memiliki paket atau artikel tidak dapat dihapus.`)) {
      return
    }

    try {
      const response = await fetch(`/api/travels/id/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Travel berhasil dihapus!')
        fetchTravels() // Refresh data
      } else {
        alert('Gagal menghapus travel: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting travel:', error)
      alert('Terjadi kesalahan saat menghapus travel')
    }
  }

  const handleResetQuota = async (id: string, name: string, currentUsed: number) => {
    if (!confirm(
      `Reset kuota untuk "${name}"?\n\n` +
      `Kuota terpakai saat ini: ${currentUsed}\n` +
      `Setelah reset, kuota akan kembali ke 0.\n\n` +
      `⚠️ Tindakan ini tidak dapat dibatalkan!`
    )) {
      return
    }

    try {
      const response = await fetch(`/api/travels/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageUsed: 0 })
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Kuota berhasil direset!')
        fetchTravels() // Refresh data
      } else {
        alert('❌ Gagal reset kuota: ' + result.error)
      }
    } catch (error) {
      console.error('Error resetting quota:', error)
      alert('❌ Terjadi kesalahan saat reset kuota')
    }
  }

  const filteredTravels = travels.filter(travel => {
    const matchesSearch = travel.name.toLowerCase().includes(search.toLowerCase()) ||
      travel.username.toLowerCase().includes(search.toLowerCase()) ||
      travel.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesCity = cityFilter === 'all' || travel.city === cityFilter
    
    return matchesSearch && matchesCity
  })

  // Pagination
  const totalTravels = filteredTravels.length
  const totalPages = Math.ceil(totalTravels / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTravels = filteredTravels.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, cityFilter, itemsPerPage])

  // Get unique cities from travels
  const availableCities = Array.from(new Set(travels.map(t => t.city).filter(Boolean))) as string[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Travel</h1>
          <p className="text-gray-600">Kelola data travel umroh</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => router.push('/admintrip/travels/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Travel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Travel</p>
          <p className="text-2xl font-bold text-gray-800">{travels.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Travel Aktif</p>
          <p className="text-2xl font-bold text-green-600">
            {travels.filter(t => t.isActive).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Travel Nonaktif</p>
          <p className="text-2xl font-bold text-red-600">
            {travels.filter(t => !t.isActive).length}
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Cari travel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kota</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Per Halaman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per halaman</SelectItem>
              <SelectItem value="10">10 per halaman</SelectItem>
              <SelectItem value="25">25 per halaman</SelectItem>
              <SelectItem value="50">50 per halaman</SelectItem>
              <SelectItem value="100">100 per halaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket Aktif
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuota Terpakai
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedTravels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data travel
                  </td>
                </tr>
              ) : (
                paginatedTravels.map((travel, index) => (
                  <tr key={travel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{startIndex + index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={travel.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(travel.name)}&background=10b981&color=fff&size=40`}
                            alt={travel.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{travel.name}</div>
                          <div className="text-sm text-gray-500">
                            {travel.city && <span className="font-medium">{travel.city} - </span>}
                            {travel.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-primary font-medium">@{travel.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{travel.email}</div>
                      <div className="text-sm text-gray-500">{travel.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full">
                        {travel._count?.packages || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full ${
                          travel.packageLimit === 999 
                            ? 'bg-green-100 text-green-800' 
                            : (travel.packageUsed || 0) >= (travel.packageLimit || 10)
                            ? 'bg-red-100 text-red-800'
                            : (travel.packageUsed || 0) >= (travel.packageLimit || 10) * 0.8
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(travel.packageUsed || 0)}/{travel.packageLimit === 999 ? '∞' : (travel.packageLimit || 10)}
                        </span>
                        {travel.packageLimit !== 999 && (travel.packageUsed || 0) >= (travel.packageLimit || 10) && (
                          <span className="text-xs text-red-600 font-medium">Kuota Habis</span>
                        )}
                        {travel.packageLimit !== 999 && (travel.packageUsed || 0) >= (travel.packageLimit || 10) * 0.8 && (travel.packageUsed || 0) < (travel.packageLimit || 10) && (
                          <span className="text-xs text-orange-600 font-medium">Hampir Habis</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          travel.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {travel.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {travel.isVerified && (
                          <span className="px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${travel.username}`)}
                          title="Lihat Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admintrip/travels/edit/${travel.id}`)}
                          title="Edit Travel"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {travel.packageLimit !== 999 && (travel.packageUsed || 0) > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleResetQuota(travel.id, travel.name, travel.packageUsed || 0)}
                            title="Reset Kuota"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(travel.id, travel.name)}
                          title="Hapus Travel"
                        >
                          <Trash2 className="w-4 h-4" />
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
        {totalTravels > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, totalTravels)}</span> dari <span className="font-medium">{totalTravels}</span> travel
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
          </div>
        )}
      </Card>
    </div>
  )
}
