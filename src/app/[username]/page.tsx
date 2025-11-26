'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PackageCard } from '@/components/package-card'
import { TravelDetailSkeleton } from '@/components/travel-detail-skeleton'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award,
  CheckCircle,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  Shield
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

interface TravelDetail {
  id: string
  username: string
  name: string
  description: string
  logo: string
  coverImage: string
  address: string
  city: string
  phone: string
  email: string
  website: string
  rating: number
  totalReviews: number
  totalJamaah: number
  yearEstablished: number
  licenses: Array<string | { type: string; number: string; validUntil: string }>
  facilities: string[]
  services: string[]
  gallery: Array<string | { url: string; caption: string }>
  legalDocs: Array<{ name: string; number: string; validUntil: string }>
  isVerified?: boolean
  isActive?: boolean
}

interface Package {
  id: string
  slug?: string
  travelUsername?: string
  packageName: string
  image: string
  departureDate: string
  duration: string
  departureCity: string
  price: number
  originalPrice?: number
  quota?: number
  cashback?: number
}

export default function TravelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [travel, setTravel] = useState<TravelDetail | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [packagesCount, setPackagesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [activeTab, setActiveTab] = useState('packages')
  const tabsRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  useEffect(() => {
    fetchTravelDetail()
    fetchPackages()
  }, [params.username])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Auto scroll when tab changes
    if (tabsRef.current) {
      const tabIndex = ['packages', 'gallery', 'legal'].indexOf(value)
      if (tabIndex >= 1) {
        // Scroll to show next tab when 2nd or 3rd tab is active
        tabsRef.current.scrollTo({
          left: tabIndex * 120,
          behavior: 'smooth'
        })
      } else if (tabIndex === 0) {
        // Scroll back to start
        tabsRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        })
      }
    }
  }

  const handleShare = () => {
    if (!travel) return

    // Format services list
    const servicesList = travel.services && travel.services.length > 0
      ? travel.services.map(service => `- ${service}`).join('\n')
      : '- Layanan Umroh Terpercaya'

    // Create share text
    const shareText = `🕌 *${travel.name}*${travel.isVerified ? ' ✅' : ''}

📋 Layanan:
${servicesList}

📦 Tersedia *${packagesCount} Paket Umroh*

Lihat detailnya di sini 👇
${window.location.href}

#TravelUmroh #UmrohTerpercaya #TripBaitullah`

    // Encode text for WhatsApp URL
    const encodedText = encodeURIComponent(shareText)
    
    // Open WhatsApp with pre-filled text
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    
    // Open in new window/tab
    window.open(whatsappUrl, '_blank')
  }

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image)
    setSelectedImageIndex(index)
  }

  const handleNextImage = () => {
    if (travel && selectedImageIndex < travel.gallery.length - 1) {
      const nextIndex = selectedImageIndex + 1
      setSelectedImageIndex(nextIndex)
      const nextItem = travel.gallery[nextIndex]
      const nextUrl = typeof nextItem === 'string' ? nextItem : nextItem.url
      setSelectedImage(nextUrl)
    }
  }

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      const prevIndex = selectedImageIndex - 1
      setSelectedImageIndex(prevIndex)
      const prevItem = travel!.gallery[prevIndex]
      const prevUrl = typeof prevItem === 'string' ? prevItem : prevItem.url
      setSelectedImage(prevUrl)
    }
  }

  const handleCloseImage = () => {
    setSelectedImage(null)
  }

  const fetchTravelDetail = async () => {
    try {
      const response = await fetch(`/api/travels/${params.username}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const travelData = result.data
        
        // Parse JSON strings to arrays
        const parsedTravel: TravelDetail = {
          ...travelData,
          licenses: travelData.licenses ? JSON.parse(travelData.licenses) : [],
          facilities: travelData.facilities ? JSON.parse(travelData.facilities) : [],
          services: travelData.services ? JSON.parse(travelData.services) : [],
          gallery: travelData.gallery ? JSON.parse(travelData.gallery) : [],
          legalDocs: travelData.legalDocs ? JSON.parse(travelData.legalDocs) : []
        }
        
        setTravel(parsedTravel)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch travel detail:', error)
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await fetch(`/api/packages?username=${params.username}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform data to match Package interface
        const transformedPackages = result.data.map((pkg: any) => ({
          id: pkg.id,
          slug: pkg.slug,
          travelUsername: pkg.travel?.username,
          packageName: pkg.name, // API uses 'name', interface uses 'packageName'
          image: pkg.image,
          departureDate: pkg.departureDate,
          duration: pkg.duration,
          departureCity: pkg.departureCity,
          price: pkg.price,
          originalPrice: pkg.originalPrice,
          quota: pkg.quotaAvailable,
          cashback: pkg.cashback
        }))
        
        setPackages(transformedPackages)
        setPackagesCount(transformedPackages.length)
      }
      setLoadingPackages(false)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
      setLoadingPackages(false)
    }
  }

  if (loading) {
    return (
      <MobileLayout hideBottomNav>
        <TravelDetailSkeleton />
      </MobileLayout>
    )
  }

  if (!travel) {
    return (
      <MobileLayout hideBottomNav>
        <div className="min-h-screen flex items-center justify-center">
          <p>Travel tidak ditemukan</p>
        </div>
      </MobileLayout>
    )
  }

  // Show inactive message if travel is not active
  if (travel.isActive === false) {
    return (
      <MobileLayout hideBottomNav>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Travel Sedang Tidak Aktif</h2>
            <p className="text-gray-600 mb-6">
              Travel ini sedang tidak aktif untuk sementara waktu.
            </p>
            <Button 
              onClick={() => router.push('/travel-umroh')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Travel
            </Button>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout hideBottomNav>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Detail Travel</h1>
          </div>
        </header>

        {/* Cover Image */}
        {travel.coverImage && (
          <div className="container mx-auto max-w-7xl px-4 pt-4">
            <div className="relative w-full aspect-[1200/485] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={travel.coverImage}
                alt={travel.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
          {/* Travel Info Card */}
          <Card className="p-4 md:p-6">
            <div className="flex gap-4 mb-4">
              {/* Logo with Shield Badge */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                {travel.logo ? (
                  <div className="w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src={travel.logo}
                      alt={travel.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-xl">
                    <span className="text-3xl md:text-4xl font-bold text-primary">
                      {travel.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Verified Badge - Shield Style */}
                {travel.isVerified && (
                  <div className="absolute -top-1 -right-1">
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-blue-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs text-primary font-medium">@{travel.username}</p>
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
                <h2 className="text-xl md:text-2xl font-bold mb-2">{travel.name}</h2>
                <div className="flex items-center gap-2">
                  {/* Departure City Badge */}
                  {travel.city && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex items-center gap-1.5 px-2.5 py-1">
                      <PlaneTakeoff className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium">{travel.city}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{packagesCount}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Paket Tersedia</div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {travel.yearEstablished ? new Date().getFullYear() - travel.yearEstablished : 0}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Tahun Pengalaman</div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {travel.legalDocs && travel.legalDocs.length > 0 
                    ? travel.legalDocs.length 
                    : travel.licenses?.length || 0}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Legalitas</div>
              </div>
            </div>

            <p className="text-sm md:text-base text-muted-foreground mb-4 whitespace-pre-line">
              {travel.description}
            </p>

            {/* Services */}
            {travel.services && travel.services.length > 0 && (
              <div className="py-4 border-t">
                <h3 className="font-semibold text-sm mb-3 text-primary">Layanan Kami</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {travel.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Licenses */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {travel.licenses.map((license, index) => {
                // Handle both string and object format
                const licenseText = typeof license === 'string' ? license : `${license.type}: ${license.number}`
                
                return (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {licenseText}
                  </Badge>
                )
              })}
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div ref={tabsRef} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <TabsList className="inline-flex w-auto bg-muted/50 p-1 rounded-xl h-auto gap-2">
                <TabsTrigger 
                  value="packages" 
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-6 font-medium text-sm whitespace-nowrap"
                >
                  Paket Umroh
                </TabsTrigger>
                <TabsTrigger 
                  value="gallery" 
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-6 font-medium text-sm whitespace-nowrap"
                >
                  Galeri Foto
                </TabsTrigger>
                <TabsTrigger 
                  value="legal" 
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-6 font-medium text-sm whitespace-nowrap"
                >
                  Legalitas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="packages" className="mt-4">
              {loadingPackages ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(4)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200"></div>
                      <div className="p-2 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      id={pkg.id}
                      slug={pkg.slug}
                      travelUsername={pkg.travelUsername}
                      image={pkg.image}
                      packageName={pkg.packageName}
                      travelName={travel?.name || ''}
                      travelLogo={travel?.logo}
                      travelVerified={travel?.isVerified}
                      departureDate={new Date(pkg.departureDate).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                      departureDateRaw={pkg.departureDate}
                      duration={pkg.duration}
                      departureCity={pkg.departureCity}
                      price={pkg.price}
                      originalPrice={pkg.originalPrice}
                      quota={pkg.quota}
                      cashback={pkg.cashback}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Belum ada paket umroh tersedia</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {travel.gallery.map((item, index) => {
                  // Handle both old format (string) and new format ({url, caption})
                  const imageUrl = typeof item === 'string' ? item : item.url
                  const imageCaption = typeof item === 'string' ? '' : item.caption
                  
                  // Skip if URL is empty
                  if (!imageUrl) return null
                  
                  return (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => handleImageClick(imageUrl, index)}
                    >
                      <Image
                        src={imageUrl}
                        alt={imageCaption || `Gallery ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                          Lihat Foto
                        </div>
                      </div>
                      {imageCaption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs line-clamp-2">{imageCaption}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="legal" className="mt-4">
              <div className="space-y-3">
                {travel.legalDocs && travel.legalDocs.length > 0 ? (
                  // Jika ada legalDocs (format JSON lengkap)
                  travel.legalDocs.map((doc, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{doc.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">No: {doc.number}</p>
                          <p className="text-xs text-muted-foreground">Berlaku hingga: {doc.validUntil}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Aktif</Badge>
                      </div>
                    </Card>
                  ))
                ) : travel.licenses && travel.licenses.length > 0 ? (
                  // Fallback: Tampilkan dari licenses (format sederhana)
                  travel.licenses.map((license, index) => {
                    // Handle both string and object format
                    const licenseText = typeof license === 'string' ? license : `${license.type}: ${license.number} (Valid until ${license.validUntil})`
                    
                    return (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{licenseText}</h4>
                            <p className="text-xs text-muted-foreground">Lisensi resmi dan terdaftar</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Aktif</Badge>
                        </div>
                      </Card>
                    )
                  })
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p>Belum ada data legalitas</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Contact Info Card */}
          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-lg mb-4 text-primary">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Alamat</p>
                  <p className="text-sm font-medium">{travel.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Telepon</p>
                  <p className="text-sm font-medium">
                    {travel.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium break-all">
                    {travel.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Website</p>
                  <p className="text-sm font-medium break-all">
                    {travel.website}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Siap memulai Perjalanan ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hubungi kami untuk informasi lebih lanjut dan konsultasi gratis
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    const phone = travel.phone.replace(/[^0-9]/g, '')
                    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(`Halo ${travel.name}, saya tertarik dengan paket umroh Anda.`)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Image Popup Full Screen */}
        {selectedImage && travel && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
            {/* Close Button */}
            <button
              onClick={handleCloseImage}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <p className="text-white text-sm font-medium">
                {selectedImageIndex + 1} / {travel.gallery.length}
              </p>
            </div>

            {/* Previous Button */}
            {selectedImageIndex > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Next Button */}
            {selectedImageIndex < travel.gallery.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Image */}
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
                <Image
                  src={selectedImage}
                  alt={`Gallery ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Caption */}
            {(() => {
              const currentItem = travel.gallery[selectedImageIndex]
              const caption = typeof currentItem === 'string' ? '' : currentItem.caption
              
              if (caption) {
                return (
                  <div className="absolute bottom-16 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10 max-w-2xl w-full px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <p className="text-white text-sm md:text-base text-center">
                        {caption}
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Swipe hint for mobile */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm md:hidden">
              <p className="text-white text-xs">Geser untuk foto berikutnya</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
