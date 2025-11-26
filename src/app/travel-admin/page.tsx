'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Eye, 
  Heart, 
  MessageCircle,
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CelebrationPopup } from '@/components/celebration-popup'
import { useCelebration } from '@/hooks/useCelebration'

interface TravelSession {
  id: string
  username: string
  name: string
}

interface PackageStats {
  id: string
  name: string
  price: number
  views: number
  favoriteCount: number
  bookingClicks: number
  departureDate: string
}

export default function TravelAdminDashboard() {
  const router = useRouter()
  const [travelSession, setTravelSession] = useState<TravelSession | null>(null)
  const [travelInfo, setTravelInfo] = useState<{ isActive: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalBookingClicks: 0,
    departedPackages: 0
  })
  const [packageLimit, setPackageLimit] = useState(10)
  const [packageUsed, setPackageUsed] = useState(0)
  const [recentPackages, setRecentPackages] = useState<PackageStats[]>([])
  
  // Celebration hook
  const {
    celebration,
    closeCelebration,
    checkPackageMilestones,
    checkTotalMilestones
  } = useCelebration()

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (session) {
      const parsedSession = JSON.parse(session)
      setTravelSession(parsedSession)
      fetchDashboardData(parsedSession.username)
      fetchTravelInfo(parsedSession.username)
    }
  }, [])

  const fetchTravelInfo = async (username: string) => {
    try {
      const response = await fetch(`/api/travel-admin/profile?username=${username}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setPackageLimit(result.data.packageLimit || 10)
        setPackageUsed(result.data.packageUsed || 0)
        setTravelInfo({ isActive: result.data.isActive })
      }
    } catch (error) {
      console.error('Error fetching travel info:', error)
    }
  }

  const fetchDashboardData = async (username: string) => {
    try {
      const response = await fetch(`/api/packages?username=${username}&includeInactive=true`)
      const result = await response.json()

      if (result.success) {
        const packages = result.data
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate stats
        const totalViews = packages.reduce((sum: number, pkg: any) => sum + (pkg.views || 0), 0)
        const totalFavorites = packages.reduce((sum: number, pkg: any) => sum + (pkg.favoriteCount || 0), 0)
        const totalBookingClicks = packages.reduce((sum: number, pkg: any) => sum + (pkg.bookingClicks || 0), 0)
        
        // Count departed packages (departure date has passed)
        const departedPackages = packages.filter((pkg: any) => {
          const departureDate = new Date(pkg.departureDate)
          departureDate.setHours(0, 0, 0, 0)
          return departureDate < today
        }).length

        setStats({
          totalPackages: packages.length,
          totalViews,
          totalFavorites,
          totalBookingClicks,
          departedPackages
        })

        // Get recent packages (last 5)
        const recent = packages.slice(0, 5).map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          views: pkg.views || 0,
          favoriteCount: pkg.favoriteCount || 0,
          bookingClicks: pkg.bookingClicks || 0,
          departureDate: pkg.departureDate
        }))

        setRecentPackages(recent)
        
        // Check milestones for celebration
        // Prepare package stats for milestone checking
        const packageStats = packages.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          views: pkg.views || 0,
          bookingClicks: pkg.bookingClicks || 0
        }))
        
        // Check package milestones
        checkPackageMilestones(packageStats)
        
        // Check total milestones
        checkTotalMilestones(totalViews, totalBookingClicks)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const conversionRate = stats.totalViews > 0 
    ? ((stats.totalBookingClicks / stats.totalViews) * 100).toFixed(2)
    : '0.00'

  return (
    <>
      {/* Celebration Popup */}
      {celebration && (
        <CelebrationPopup
          isOpen={true}
          onClose={closeCelebration}
          title={celebration.title}
          message={celebration.message}
          emoji={celebration.emoji}
          type={celebration.type}
        />
      )}
      
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Selamat Datang, {travelSession?.name}! 👋
            </h1>
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
          <p className="text-gray-600 mt-1">
            Kelola paket umroh Anda dan pantau performa
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paket Aktif</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalPackages}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sudah Berangkat</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.departedPackages}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Dilihat</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Favorit</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.totalFavorites.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Klik Booking</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.totalBookingClicks.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Package Quota Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/90 text-sm font-medium">📦 Kuota Paket Umroh</p>
            <p className="text-2xl font-bold mt-1">
              {packageUsed} / {packageLimit === 999 ? '∞' : packageLimit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/90 text-xs">Sisa Slot</p>
            <p className="text-xl font-bold">
              {packageLimit === 999 ? '∞' : Math.max(0, packageLimit - packageUsed)}
            </p>
          </div>
        </div>
        
        {/* Progress Bar based on packageUsed */}
        {packageLimit !== 999 && (
          <div className="space-y-2">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (packageUsed / packageLimit) >= 0.9 
                    ? 'bg-red-400' 
                    : (packageUsed / packageLimit) >= 0.7 
                    ? 'bg-yellow-400' 
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((packageUsed / packageLimit) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>{((packageUsed / packageLimit) * 100).toFixed(0)}% terpakai</span>
              {packageUsed >= packageLimit ? (
                <span className="font-semibold text-red-200">⚠️ Kuota habis!</span>
              ) : packageUsed >= packageLimit * 0.8 ? (
                <span className="font-semibold text-yellow-200">⚠️ Mendekati batas</span>
              ) : (
                <span>Masih tersedia</span>
              )}
            </div>
          </div>
        )}
        
        {packageLimit === 999 && (
          <p className="text-white/80 text-sm">
            ✨ Anda memiliki paket <strong>Unlimited</strong> - Tambahkan paket tanpa batas!
          </p>
        )}
      </Card>

      {/* Conversion Rate */}
      <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm">Conversion Rate</p>
            <p className="text-4xl font-bold mt-2">{conversionRate}%</p>
            <p className="text-white/80 text-sm mt-1">
              Dari {stats.totalViews} views → {stats.totalBookingClicks} booking clicks
            </p>
          </div>
          <TrendingUp className="w-16 h-16 text-white/30" />
        </div>
      </Card>

      {/* Paket Terpopuler */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Paket Terpopuler</h3>
        {recentPackages.length > 0 ? (
          <div className="space-y-3">
            {recentPackages.slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{pkg.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {pkg.views}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {pkg.favoriteCount}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {pkg.bookingClicks}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Belum ada paket
          </p>
        )}
      </Card>
      </div>
    </>
  )
}
