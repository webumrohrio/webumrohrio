'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Package, 
  FileText, 
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  ShoppingCart,
  Filter
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface PackageData {
  id: string
  name: string
  price: number
  departureDate: string
  travel: {
    name: string
  }
}

interface TravelData {
  id: string
  name: string
  city: string
  logo: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTravels: 0,
    totalPackages: 0,
    totalArticles: 0,
    totalUsers: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalBookings: 0
  })
  const [recentPackages, setRecentPackages] = useState<PackageData[]>([])
  const [recentTravels, setRecentTravels] = useState<TravelData[]>([])
  const [adminName, setAdminName] = useState('Admin')
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')

  useEffect(() => {
    fetchStats()
    fetchRecentData()
    fetchAdminProfile()
  }, [period])

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/admintrip/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setAdminName(data.data.name)
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const [travelsRes, packagesRes, articlesRes, usersRes, packageStatsRes] = await Promise.all([
        fetch(`/api/travels?period=${period}`),
        fetch(`/api/packages?period=${period}`),
        fetch(`/api/articles?period=${period}`),
        fetch(`/api/users?period=${period}`),
        fetch(`/api/admintrip/package-stats?period=${period}`)
      ])

      const travelsData = await travelsRes.json()
      const packagesData = await packagesRes.json()
      const articlesData = await articlesRes.json()
      const usersData = await usersRes.json()
      const packageStatsData = await packageStatsRes.json()

      setStats({
        totalTravels: travelsData.total || travelsData.data?.length || 0,
        totalPackages: packagesData.total || packagesData.data?.length || 0,
        totalArticles: articlesData.total || articlesData.data?.length || 0,
        totalUsers: usersData.total || usersData.data?.length || 0,
        totalViews: packageStatsData.success ? packageStatsData.data.totalViews : 0,
        totalFavorites: packageStatsData.success ? packageStatsData.data.totalFavorites : 0,
        totalBookings: packageStatsData.success ? packageStatsData.data.totalBookings : 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentData = async () => {
    try {
      const [packagesRes, travelsRes] = await Promise.all([
        fetch(`/api/packages?limit=5&period=${period}&simpleSort=true`),
        fetch(`/api/travels?limit=5&period=${period}`)
      ])

      const packagesData = await packagesRes.json()
      const travelsData = await travelsRes.json()

      if (packagesData.success && packagesData.data) {
        setRecentPackages(packagesData.data)
      }

      if (travelsData.success && travelsData.data) {
        setRecentTravels(travelsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch recent data:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Travel',
      value: stats.totalTravels,
      icon: Plane,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Total Paket',
      value: stats.totalPackages,
      icon: Package,
      color: 'bg-green-500',
      trend: '+8%'
    },
    {
      title: 'Total Artikel',
      value: stats.totalArticles,
      icon: FileText,
      color: 'bg-purple-500',
      trend: '+5%'
    },
    {
      title: 'Total User',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-orange-500',
      trend: '+23%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang, {adminName}! 👋</h1>
          <p className="text-gray-600">Berikut adalah ringkasan data website Anda</p>
        </div>
        
        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            <Button
              variant={period === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('day')}
            >
              Hari Ini
            </Button>
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              Minggu Ini
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Bulan Ini
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Tahun Ini
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Package Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Paket di Lihat</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalViews.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-1">Kumulatif semua waktu</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Paket di Favoritkan</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalFavorites.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-1">Berdasarkan periode filter</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Paket di Booking</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalBookings.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-1">Kumulatif semua waktu</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packages */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Paket Terbaru
          </h3>
          <div className="space-y-3">
            {recentPackages.length > 0 ? (
              recentPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pkg.name}</p>
                    <p className="text-xs text-gray-500">{pkg.travel.name}</p>
                    <p className="text-xs text-primary font-semibold">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">
                      {new Date(pkg.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada paket</p>
            )}
          </div>
        </Card>

        {/* Recent Travels */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Travel Terbaru
          </h3>
          <div className="space-y-3">
            {recentTravels.length > 0 ? (
              recentTravels.map((travel) => (
                <div key={travel.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {travel.logo ? (
                      <img
                        src={travel.logo}
                        alt={travel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Plane className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{travel.name}</p>
                    <p className="text-xs text-gray-500">{travel.city || 'Indonesia'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(travel.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada travel</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Plane className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Tambah Travel</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Package className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Tambah Paket</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Tambah Artikel</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Tambah User</p>
          </button>
        </div>
      </Card>
    </div>
  )
}
