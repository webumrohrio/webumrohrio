'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Edit, ExternalLink, MapPin, Phone, Mail, Globe, PlaneTakeoff
} from 'lucide-react'
import Image from 'next/image'

interface TravelProfile {
  id: string
  username: string
  email: string | null
  name: string
  description: string | null
  logo: string | null
  coverImage: string | null
  city: string | null
  address: string | null
  phone: string | null
  website: string | null
  rating: number
  totalReviews: number
  totalJamaah: number
  yearEstablished: number | null
  isActive: boolean
  isVerified: boolean
  packageLimit: number
  packageUsed: number
  gallery: string[]
  licenses: any[]
  services: string[]
}

export default function TravelProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TravelProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (!session) {
      router.push('/travel-admin/login')
      return
    }

    try {
      const parsed = JSON.parse(session)
      if (!parsed.username) {
        router.push('/travel-admin/login')
        return
      }
      
      fetchProfile(parsed.username)
    } catch (error) {
      console.error('Error parsing session:', error)
      router.push('/travel-admin/login')
    }
  }, [router])

  const fetchProfile = async (username: string) => {
    try {
      const response = await fetch(`/api/travel-admin/profile?username=${username}`)
      const result = await response.json()

      if (result.success && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Button onClick={() => router.push('/travel-admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/travel-admin')}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base md:text-xl font-bold text-gray-800">Profile Travel</h1>
                  {profile.isActive ? (
                    <Badge className="bg-green-500 text-white px-2 py-0.5 text-xs">
                      ✓ Aktif
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500 text-white px-2 py-0.5 text-xs">
                      ⚠ Tidak Aktif
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${profile.username}`, '_blank')}
                className="hidden md:flex"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat Halaman Travel
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`/${profile.username}`, '_blank')}
                className="md:hidden"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cover Image */}
        {profile.coverImage && (
          <div className="relative w-full aspect-[1200/485] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={profile.coverImage}
              alt={`${profile.name} Cover`}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Profile Card */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Header Section with Logo and Name */}
            <div className="flex gap-4">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white border-2 border-gray-200 overflow-hidden">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-3xl font-bold text-primary">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -top-2 -right-2">
                  <svg className="w-8 h-8 text-blue-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-sm text-green-600 font-medium mb-1">@{profile.username}</p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  {profile.name}
                </h2>
                {profile.city && (
                  <div className="mb-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <PlaneTakeoff className="w-3 h-3 mr-1" />
                      {profile.city}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Data Analitik */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{profile.packageUsed}</p>
                  <p className="text-xs text-gray-600">Paket Tersedia</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{profile.yearEstablished ? new Date().getFullYear() - profile.yearEstablished : 0}</p>
                  <p className="text-xs text-gray-600">Tahun Pengalaman</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{profile.licenses?.length || 0}</p>
                  <p className="text-xs text-gray-600">Legalitas</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{profile.gallery?.length || 0}</p>
                  <p className="text-xs text-gray-600">Galeri Foto</p>
                </div>
              </div>

            {/* Deskripsi */}
            {profile.description && (
              <p className="text-gray-600 text-sm whitespace-pre-line text-left">{profile.description}</p>
            )}
          </div>
        </Card>

        {/* Layanan Kami */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-green-600 mb-4">Layanan Kami</h3>
          {profile.services && profile.services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {profile.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* License Buttons */}
          {profile.licenses && profile.licenses.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {profile.licenses.map((license: any, index: number) => {
                // Handle both string and object format
                const licenseName = typeof license === 'string' ? license : license.name
                const licenseFile = typeof license === 'object' ? license.file : null
                
                return licenseName ? (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-gray-700 border-gray-300"
                    onClick={() => licenseFile && window.open(licenseFile, '_blank')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {licenseName}
                  </Button>
                ) : null
              })}
            </div>
          )}
        </Card>

        {/* Contact Info */}
        {(profile.address || profile.phone || profile.email || profile.website) && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-green-600 mb-6">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {profile.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Alamat</p>
                      <p className="text-sm text-gray-800 font-medium">{profile.address}</p>
                    </div>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-gray-800 font-medium">{profile.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Telepon</p>
                      <p className="text-sm text-gray-800 font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Website</p>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 font-medium hover:text-green-600 transition-colors"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Floating Action Button - Edit Profile */}
      <button
        onClick={() => router.push('/travel-admin/profile/edit')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group hover:scale-110 active:scale-95"
        aria-label="Edit Profile"
      >
        <Edit className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      </button>
    </div>
  )
}
