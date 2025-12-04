'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search, Phone, Users, Package, Building2, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface BookingLog {
  id: string
  name: string
  phone: string
  pax: number
  packageName: string
  selectedPackageName: string | null
  packagePrice: number | null
  travelName: string
  travelUsername: string | null
  isGuest: boolean
  userId: string | null
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('day')

  useEffect(() => {
    fetchBookings()
  }, [currentPage, period])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const periodParam = period !== 'all' ? `&period=${period}` : ''
      const response = await fetch(`/api/admintrip/booking-logs?page=${currentPage}&pageSize=50${periodParam}`)
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalCount(result.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data booking ini?')) return

    try {
      const response = await fetch(`/api/admintrip/booking-logs/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchBookings()
      } else {
        alert('Gagal menghapus data booking')
      }
    } catch (error) {
      console.error('Failed to delete booking:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const filteredBookings = bookings.filter(booking =>
    booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.phone.includes(searchQuery) ||
    booking.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.travelName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Booking</h1>
          <p className="text-gray-600">Kelola data booking dari user</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600">Total Paket di Pilih</p>
            <p className="text-2xl font-bold text-primary">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Period */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filter Periode:</span>
          <Button
            variant={period === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('all')
              setCurrentPage(1)
            }}
          >
            Semua
          </Button>
          <Button
            variant={period === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('day')
              setCurrentPage(1)
            }}
          >
            Hari Ini
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('week')
              setCurrentPage(1)
            }}
          >
            Minggu Ini
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('month')
              setCurrentPage(1)
            }}
          >
            Bulan Ini
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('year')
              setCurrentPage(1)
            }}
          >
            Tahun Ini
          </Button>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari nama, nomor WhatsApp, paket, atau travel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Jamaah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data booking'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * 50 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {booking.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                          <div className="text-xs text-gray-500">
                            {booking.isGuest ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                Guest
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                User Login
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-gray-900">{booking.pax} orang</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <Package className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-900 line-clamp-2">{booking.packageName}</div>
                          {booking.selectedPackageName && booking.packagePrice && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {booking.selectedPackageName} - {formatCurrency(booking.packagePrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-900">{booking.travelName}</div>
                          {booking.travelUsername && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              @{booking.travelUsername}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
