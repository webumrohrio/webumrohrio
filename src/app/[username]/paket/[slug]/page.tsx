'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PackageDetailSkeleton } from '@/components/package-detail-skeleton'
import { ArrowLeft, MapPin, Calendar, Clock, Plane, CheckCircle, Building2, Share2, Heart, ChevronLeft, ChevronRight, X, Users } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface PriceOption {
  id: string
  name: string
  price: number
  originalPrice?: number
  cashback?: number
  hotelMakkah: string
  hotelMadinah: string
  description?: string
  isBestSeller?: boolean
}

interface PackageDetail {
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
  category: string
  slug: string
  travel: {
    id: string
    name: string
    rating: number
    logo?: string
    username?: string
    isVerified?: boolean
    phone?: string
  }
  priceOptions: PriceOption[]
  facilities: string[]
  itinerary: Array<{
    day: number
    title: string
    description: string
  }>
  includes: string[]
  excludes: string[]
}

export default function DetailPaketUmrohSlug() {
  const params = useParams()
  const router = useRouter()
  
  // All hooks must be at the top level, before any conditions or returns
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPrice, setSelectedPrice] = useState<PriceOption | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    pax: 1
  })
  const [whatsappSettings, setWhatsappSettings] = useState({ routing: 'travel', adminPhone: '' })
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // Array refs for price option cards (auto-scroll feature)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleToggleFavorite = async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (!isLoggedIn || !user) {
      setShowLoginModal(true)
      return
    }

    const userData = JSON.parse(user)
    
    try {
      if (!isFavorite) {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            packageId: packageDetail?.id
          })
        })

        const result = await response.json()

        if (result.success) {
          setIsFavorite(true)
          setAlertMessage('Paket berhasil disimpan ke favorit!')
          setAlertType('success')
        } else {
          setAlertMessage(result.message || 'Gagal menyimpan ke favorit')
          setAlertType('error')
        }
      } else {
        const response = await fetch(`/api/favorites?email=${encodeURIComponent(userData.email)}&packageId=${packageDetail?.id}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (result.success) {
          setIsFavorite(false)
          setAlertMessage('Paket dihapus dari favorit')
          setAlertType('error')
        } else {
          setAlertMessage(result.message || 'Gagal menghapus dari favorit')
          setAlertType('error')
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
      setAlertMessage('Terjadi kesalahan')
      setAlertType('error')
    }
    
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleShare = () => {
    if (!packageDetail) return

    let lowestPrice = packageDetail.price
    let highestCashback = packageDetail.cashback || 0

    if (packageDetail.priceOptions && packageDetail.priceOptions.length > 0) {
      lowestPrice = Math.min(...packageDetail.priceOptions.map(opt => opt.price))
      highestCashback = Math.max(...packageDetail.priceOptions.map(opt => opt.cashback || 0))
    }

    const departureDate = new Date(packageDetail.departureDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const shareText = `🕌 *${packageDetail.name}*

🏢 ${packageDetail.travel.name}${packageDetail.travel.isVerified ? ' ✅' : ''}

⏱️ Durasi: ${packageDetail.duration}
📅 Keberangkatan: ${departureDate}
✈️ Kota Keberangkatan: ${packageDetail.departureCity}
💰 Harga Mulai: ${formatCurrency(lowestPrice)}${highestCashback > 0 ? `\n🎁 Cashback: ${formatCurrency(highestCashback)}` : ''}

🔗 Info & Booking:
${window.location.href}

#UmrohHemat #PaketUmroh #TripBaitullah`

    const encodedText = encodeURIComponent(shareText)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  const handleBooking = () => {
    if (!packageDetail) return

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')

    if (isLoggedIn && user) {
      // User logged in - show modal with pre-filled data
      const userData = JSON.parse(user)
      let phone = userData.phone || ''
      
      // Ensure phone starts with 62
      if (phone && !phone.startsWith('62')) {
        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1)
        } else if (phone.startsWith('8')) {
          phone = '62' + phone
        }
      }
      
      setBookingForm({
        name: userData.name || '',
        phone: phone,
        pax: 1
      })
      setShowBookingModal(true)
    } else {
      // User not logged in - show booking modal
      // Try to load saved data from localStorage or database
      loadGuestBookingData()
      setShowBookingModal(true)
    }
  }

  const loadGuestBookingData = () => {
    // First, try localStorage (instant)
    const savedData = localStorage.getItem('guestBookingData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        let phone = data.phone || ''
        
        // Ensure phone starts with 62
        if (phone && !phone.startsWith('62')) {
          if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1)
          } else if (phone.startsWith('8')) {
            phone = '62' + phone
          }
        }
        
        setBookingForm({
          name: data.name || '',
          phone: phone,
          pax: data.pax || 1
        })
      } catch (error) {
        console.error('Failed to parse saved booking data:', error)
      }
    }
  }

  const handleBookingSubmit = async () => {
    // Validate form
    if (!bookingForm.name.trim()) {
      setAlertMessage('Nama harus diisi')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    if (!bookingForm.phone.trim()) {
      setAlertMessage('Nomor WhatsApp harus diisi')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    const cleanPhone = bookingForm.phone.replace(/[^0-9]/g, '')
    
    // Validate phone format (should start with 62 and have at least 11 digits total)
    if (!cleanPhone.startsWith('62')) {
      setAlertMessage('Nomor WhatsApp harus diawali dengan 62')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }
    
    if (cleanPhone.length < 11 || cleanPhone.length > 15) {
      setAlertMessage('Nomor WhatsApp tidak valid (11-15 digit)')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    if (bookingForm.pax < 1) {
      setAlertMessage('Jumlah orang minimal 1')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    // Save to localStorage (instant)
    localStorage.setItem('guestBookingData', JSON.stringify({
      name: bookingForm.name,
      phone: cleanPhone,
      pax: bookingForm.pax
    }))

    // Save to database (background)
    try {
      await fetch('/api/guest-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: cleanPhone,
          defaultPax: bookingForm.pax
        })
      })
    } catch (error) {
      console.error('Failed to save to database:', error)
      // Continue anyway - localStorage is enough
    }

    // Close modal and proceed to WhatsApp
    setShowBookingModal(false)
    proceedToWhatsApp(bookingForm.name, cleanPhone, bookingForm.pax)
  }

  const proceedToWhatsApp = (userName: string, userPhone: string, pax: number) => {
    if (!packageDetail) return

    const departureDate = new Date(packageDetail.departureDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const selectedPackageName = selectedPrice?.name || 'Paket Standar'
    const selectedPackagePrice = selectedPrice?.price || packageDetail.price
    const selectedPackageCashback = selectedPrice?.cashback || packageDetail.cashback || 0

    const whatsappRouting = whatsappSettings.routing
    const adminWhatsapp = whatsappSettings.adminPhone

    const recipientName = whatsappRouting === 'admin' ? 'Tripbaitullah' : packageDetail.travel.name
    let phone = ''
    
    if (whatsappRouting === 'admin') {
      phone = adminWhatsapp
    } else {
      phone = packageDetail.travel.phone ? packageDetail.travel.phone.replace(/[^0-9]/g, '') : ''
    }

    const bookingText = `Halo ${recipientName},

Saya ingin booking Paket Umroh

*${packageDetail.name}*

👤 Nama: ${userName}
📱 WhatsApp: ${userPhone}
👥 Jumlah Jamaah: ${pax} orang

🏢 ${packageDetail.travel.name}
⏱️ Durasi: ${packageDetail.duration}
✈️ Keberangkatan: ${packageDetail.departureCity}
📅 Tanggal: ${departureDate}

*${selectedPackageName}*
💰 Biaya: ${formatCurrency(selectedPackagePrice)}${selectedPackageCashback > 0 ? `\n🎁 Cashback: ${formatCurrency(selectedPackageCashback)}` : ''}

🔗 Link Paket:
${window.location.href}

Terima kasih.`
    
    const encodedText = encodeURIComponent(bookingText)
    const whatsappUrl = phone 
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`
    
    // IMPORTANT: Redirect IMMEDIATELY to avoid Safari popup blocker
    // Use window.location.href for better mobile compatibility
    window.location.href = whatsappUrl
    
    // Track booking click in background (non-blocking)
    fetch(`/api/packages/${packageDetail.id}/booking-click`, {
      method: 'POST'
    }).catch(err => console.error('Failed to track booking click:', err))

    // Log booking to database in background (non-blocking)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    let userId = null
    let isGuest = true
    
    if (isLoggedIn && user) {
      try {
        const userData = JSON.parse(user)
        userId = userData.id || null
        isGuest = false
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }

    fetch('/api/admintrip/booking-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userName,
        phone: userPhone,
        pax: pax,
        packageId: packageDetail.id,
        packageName: packageDetail.name,
        selectedPackageName: selectedPackageName,
        packagePrice: selectedPackagePrice,
        travelName: packageDetail.travel.name,
        travelUsername: packageDetail.travel.username || null,
        isGuest: isGuest,
        userId: userId
      })
    }).catch(error => console.error('Failed to log booking:', error))
  }

  const fetchWhatsappSettings = async () => {
    try {
      const [routingRes, phoneRes] = await Promise.all([
        fetch('/api/settings?key=whatsappRouting'),
        fetch('/api/settings?key=adminWhatsapp')
      ])
      
      const routingResult = await routingRes.json()
      const phoneResult = await phoneRes.json()
      
      setWhatsappSettings({
        routing: routingResult.success && routingResult.data ? routingResult.data.value : 'travel',
        adminPhone: phoneResult.success && phoneResult.data ? phoneResult.data.value : ''
      })
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error)
    }
  }

  useEffect(() => {
    fetchPackageDetail()
    fetchWhatsappSettings()
  }, [params.username, params.slug])

  useEffect(() => {
    if (packageDetail) {
      checkFavoriteStatus()
    }
  }, [packageDetail])

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 6 : 4)
    }
    
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  const checkFavoriteStatus = async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (isLoggedIn && user && packageDetail) {
      const userData = JSON.parse(user)
      
      try {
        const response = await fetch(`/api/favorites?email=${encodeURIComponent(userData.email)}`)
        const result = await response.json()
        
        if (result.success) {
          setIsFavorite(result.data.includes(packageDetail.id))
        }
      } catch (error) {
        console.error('Check favorite error:', error)
        setIsFavorite(false)
      }
    } else {
      setIsFavorite(false)
    }
  }

  const fetchPackageDetail = async () => {
    try {
      // Fetch by username and slug
      const response = await fetch(`/api/packages?username=${params.username}&slug=${params.slug}`)
      const result = await response.json()
      
      if (result.success && result.data && result.data.length > 0) {
        const pkg = result.data[0]
        
        const priceOptionsWithId = (pkg.priceOptions || []).map((opt: any, index: number) => ({
          ...opt,
          id: opt.id || `price-${index}`
        }))
        
        const packageData: PackageDetail = {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          image: pkg.image,
          price: pkg.price,
          duration: pkg.duration,
          departureCity: pkg.departureCity,
          departureDate: pkg.departureDate,
          quota: pkg.quota,
          quotaAvailable: pkg.quotaAvailable,
          cashback: pkg.cashback,
          category: pkg.category,
          slug: pkg.slug,
          travel: pkg.travel,
          priceOptions: priceOptionsWithId,
          facilities: pkg.facilities || [],
          itinerary: pkg.itinerary || [],
          includes: pkg.includes || [],
          excludes: pkg.excludes || []
        }
        
        setPackageDetail(packageData)
        
        if (packageData.priceOptions && packageData.priceOptions.length > 0) {
          setSelectedPrice(packageData.priceOptions[0])
        }
      } else {
        setAlertMessage('Paket tidak ditemukan')
        setAlertType('error')
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Failed to fetch package:', error)
      setAlertMessage('Gagal memuat data paket')
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MobileLayout hideBottomNav>
        <PackageDetailSkeleton />
      </MobileLayout>
    )
  }

  if (!packageDetail) {
    return (
      <MobileLayout hideBottomNav>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Paket tidak ditemukan</p>
        </div>
      </MobileLayout>
    )
  }

  const getDepartureTiming = () => {
    const now = new Date()
    const departure = new Date(packageDetail.departureDate)
    const currentMonth = now.getMonth()
    const departureMonth = departure.getMonth()
    
    if (currentMonth === departureMonth) return 'Bulan Ini'
    if (currentMonth + 1 === departureMonth) return 'Bulan Depan'
    return null
  }

  const departureTiming = getDepartureTiming()

  return (
    <MobileLayout hideBottomNav>
      <div className="min-h-screen bg-background">
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            ></div>
            
            <div className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">Login Diperlukan</h3>
              
              <p className="text-center text-muted-foreground mb-6">
                Silakan login terlebih dahulu untuk menyimpan paket umroh ke favorit Anda
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLoginModal(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setShowLoginModal(false)
                    router.push('/login')
                  }}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (() => {
          const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
          
          return (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowBookingModal(false)}
              ></div>
              
              <div className="relative bg-card rounded-t-3xl md:rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-center mb-2">Booking Paket Umroh</h3>
                
                {isLoggedIn && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      ✓ Data Anda sudah terisi otomatis dari profil
                    </p>
                  </div>
                )}
                
                <p className="text-center text-sm text-muted-foreground mb-6">
                  Kami akan menghubungkan Anda ke Travel Paket Umroh yang Anda pilih.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="booking-name" className="text-sm font-medium mb-2 block">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking-name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      disabled={isLoggedIn}
                      className="w-full disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-phone" className="text-sm font-medium mb-2 block">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        +62
                      </div>
                      <Input
                        id="booking-phone"
                        type="tel"
                        placeholder="8123456789"
                        value={bookingForm.phone.startsWith('62') ? bookingForm.phone.substring(2) : bookingForm.phone.startsWith('0') ? bookingForm.phone.substring(1) : bookingForm.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setBookingForm({ ...bookingForm, phone: '62' + value })
                        }}
                        disabled={isLoggedIn}
                        className="w-full pl-12 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                <div>
                  <Label htmlFor="booking-pax" className="text-sm font-medium mb-2 block">
                    Jumlah Jamaah <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setBookingForm({ ...bookingForm, pax: Math.max(1, bookingForm.pax - 1) })}
                      disabled={bookingForm.pax <= 1}
                    >
                      -
                    </Button>
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border rounded-lg bg-muted/30">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold">{bookingForm.pax}</span>
                      <span className="text-sm text-muted-foreground">orang</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setBookingForm({ ...bookingForm, pax: bookingForm.pax + 1 })}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base"
                  onClick={handleBookingSubmit}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Kirim ke WhatsApp
                </Button>
              </div>

              {!isLoggedIn && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Data Anda akan disimpan untuk mempermudah booking selanjutnya
                </p>
              )}
            </div>
          </div>
          )
        })()}

        {/* Notification */}
        {showAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm ${
              alertType === 'success' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              <p className="font-medium">{alertMessage}</p>
            </div>
          </div>
        )}

        {/* Header with Back Button */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Detail Paket</h1>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 pt-4 pb-6 space-y-6">
          {/* Image Hero */}
          <div className="relative w-full rounded-xl overflow-hidden">
            <Image
              src={packageDetail.image}
              alt={packageDetail.name}
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>
          {/* Package Info */}
          <Card className="p-4 md:p-6">
            {/* Departure Timing Badge and Action Buttons */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                {departureTiming && (
                  <Badge className={`${departureTiming === 'Bulan Ini' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                    <Plane className="w-3 h-3 mr-1" />
                    {departureTiming}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="flex items-center gap-2"
                >
                  <Heart 
                    className={`w-4 h-4 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="hidden sm:inline">{isFavorite ? 'Tersimpan' : 'Simpan'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <Share2 className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline font-medium">Share ke WhatsApp</span>
                </Button>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">{packageDetail.name}</h2>
            
            {/* Travel Info - Clickable */}
            <div 
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer mb-4"
              onClick={() => {
                if (packageDetail.travel.username) {
                  router.push(`/${packageDetail.travel.username}`)
                } else {
                  router.push(`/travel-umroh/${packageDetail.travel.id}`)
                }
              }}
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full overflow-hidden rounded-full">
                  {packageDetail.travel.logo ? (
                    <Image
                      src={packageDetail.travel.logo}
                      alt={packageDetail.travel.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(packageDetail.travel.name)}&background=10b981&color=fff&size=56&bold=true`}
                      alt={packageDetail.travel.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  )}
                </div>
                {packageDetail.travel.isVerified && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Diselenggarakan oleh</p>
                <p className="font-semibold text-base md:text-lg text-primary">{packageDetail.travel.name}</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </div>

            <p className="text-sm md:text-base text-muted-foreground mb-4 whitespace-pre-line">
              {packageDetail.description}
            </p>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Keberangkatan</p>
                  <p className="text-sm font-medium">{new Date(packageDetail.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Durasi</p>
                  <p className="text-sm font-medium">{packageDetail.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Dari</p>
                  <p className="text-sm font-medium">{packageDetail.departureCity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Penerbangan</p>
                  <p className="text-sm font-medium">Langsung</p>
                </div>
              </div>
            </div>

          </Card>

          {/* Tabs */}
          <Tabs defaultValue="facilities" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="facilities" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 font-medium"
              >
                Fasilitas
              </TabsTrigger>
              <TabsTrigger 
                value="itinerary" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 font-medium"
              >
                Itinerary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  {(() => {
                    const totalPages = Math.ceil(packageDetail.itinerary.length / itemsPerPage)
                    
                    const handleTouchStart = (e: React.TouchEvent) => {
                      setTouchStart(e.targetTouches[0].clientX)
                    }

                    const handleTouchMove = (e: React.TouchEvent) => {
                      setTouchEnd(e.targetTouches[0].clientX)
                    }

                    const handleTouchEnd = () => {
                      if (!touchStart || !touchEnd) return
                      
                      const distance = touchStart - touchEnd
                      const isLeftSwipe = distance > 50
                      const isRightSwipe = distance < -50

                      if (isLeftSwipe && currentPage < totalPages - 1) {
                        setCurrentPage(currentPage + 1)
                      }
                      if (isRightSwipe && currentPage > 0) {
                        setCurrentPage(currentPage - 1)
                      }

                      setTouchStart(0)
                      setTouchEnd(0)
                    }

                    const goToPage = (page: number) => {
                      setCurrentPage(page)
                    }

                    return (
                      <>
                        <div 
                          className="relative overflow-hidden"
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <div 
                            className="flex transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(-${currentPage * 100}%)` }}
                          >
                            {Array.from({ length: totalPages }).map((_, pageIndex) => {
                              const startIndex = pageIndex * itemsPerPage
                              const endIndex = startIndex + itemsPerPage
                              const pageItems = packageDetail.itinerary.slice(startIndex, endIndex)

                              return (
                                <div 
                                  key={pageIndex}
                                  className="w-full flex-shrink-0 space-y-4 min-h-[400px]"
                                >
                                  {pageItems.map((item, index) => (
                                    <div 
                                      key={item.day} 
                                      className={`flex gap-4 ${index !== pageItems.length - 1 ? 'pb-4 border-b' : ''}`}
                                    >
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                          {item.day}
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {totalPages > 1 && (
                          <>
                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-muted-foreground">Geser untuk melihat lainnya →</p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (currentPage > 0) {
                                        setCurrentPage(currentPage - 1)
                                      }
                                    }}
                                    disabled={currentPage === 0}
                                    className="hidden md:flex items-center gap-1 h-8 px-3"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-xs">Prev</span>
                                  </Button>

                                  <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, index) => (
                                      <button
                                        key={index}
                                        onClick={() => goToPage(index)}
                                        className={`transition-all ${
                                          currentPage === index
                                            ? 'w-8 h-2 bg-primary rounded-full'
                                            : 'w-2 h-2 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                                        }`}
                                        aria-label={`Go to page ${index + 1}`}
                                      />
                                    ))}
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (currentPage < totalPages - 1) {
                                        setCurrentPage(currentPage + 1)
                                      }
                                    }}
                                    disabled={currentPage === totalPages - 1}
                                    className="hidden md:flex items-center gap-1 h-8 px-3"
                                  >
                                    <span className="text-xs">Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="facilities" className="mt-4">
              <Card className="p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">✓ Termasuk dalam Paket</h3>
                    <div className="space-y-2">
                      {packageDetail.includes.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t"></div>

                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">✗ Tidak Termasuk</h3>
                    <div className="space-y-2">
                      {packageDetail.excludes.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-red-600 flex-shrink-0">✗</span>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pilih Paket Section */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pilih Paket</h3>
              <p className="text-xs text-muted-foreground">Geser untuk melihat paket lainnya →</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {packageDetail.priceOptions.map((option, index) => (
                  <div
                    key={option.id}
                    ref={(el) => { cardRefs.current[index] = el }}
                    onClick={() => {
                      setSelectedPrice(option)
                      // Auto scroll card to center
                      setTimeout(() => {
                        cardRefs.current[index]?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'nearest',
                          inline: 'center' 
                        })
                      }, 100)
                    }}
                    className={`flex-shrink-0 w-[280px] md:w-[320px] p-4 rounded-xl border-2 cursor-pointer active:scale-95 transition-transform relative ${
                      selectedPrice?.id === option.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border'
                    }`}
                  >
                  {option.isBestSeller && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white shadow-lg px-2.5 py-1 text-xs">
                        ⭐ Best Seller
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <h4 className="font-bold text-base md:text-lg mb-2">{option.name}</h4>
                    <div>
                      {option.originalPrice && option.originalPrice > option.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatCurrency(option.originalPrice)}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(option.price)}</p>
                        <p className="text-xs text-muted-foreground">per orang</p>
                      </div>
                      {option.cashback != null && option.cashback > 0 && (
                        <div className="mt-1 inline-block">
                          <Badge className="bg-orange-100 text-orange-600 border border-orange-300">
                            💰 Cashback {formatCurrency(option.cashback)}
                          </Badge>
                        </div>
                      )}
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pb-3 border-b mb-3"></div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Hotel Makkah</p>
                        <p className="text-sm font-medium">{option.hotelMakkah}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Hotel Madinah</p>
                        <p className="text-sm font-medium">{option.hotelMadinah}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Bottom CTA - Hidden when modal is open */}
        {!showBookingModal && (
          <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg z-50">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{selectedPrice?.name || 'Harga'}</p>
                  <p className="text-lg md:text-xl font-bold text-primary">
                    {selectedPrice ? formatCurrency(selectedPrice.price) : formatCurrency(packageDetail.price)}
                  </p>
                  {((selectedPrice?.cashback && selectedPrice.cashback > 0) || (!selectedPrice && packageDetail.cashback && packageDetail.cashback > 0)) && (
                    <p className="text-xs text-orange-600 font-medium mt-0.5">
                      💰 Cashback {formatCurrency((selectedPrice?.cashback && selectedPrice.cashback > 0) ? selectedPrice.cashback : (packageDetail.cashback || 0))}
                    </p>
                  )}
                </div>
                <Button 
                  size="lg"
                  onClick={handleBooking}
                  className="flex-1 md:flex-none md:px-12 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Pilih Paket
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
