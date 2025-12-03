'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CoverCropModal } from '@/components/cover-crop-modal'
import { toast } from 'sonner'

export default function EditTravelProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    description: '',
    logo: '',
    coverImage: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    rating: 4.5,
    totalReviews: 0,
    totalJamaah: 0,
    yearEstablished: new Date().getFullYear(),
    licenses: '',
    facilities: '',
    services: '',
    isActive: true
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [galleryCaptions, setGalleryCaptions] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  
  // Cover image crop modal
  const [showCoverCropModal, setShowCoverCropModal] = useState(false)
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(null)
  
  // Username validation
  const [originalUsername, setOriginalUsername] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (!session) {
      router.push('/travel-admin/login')
      return
    }

    fetchTravelData()
  }, [router])

  const fetchTravelData = async () => {
    try {
      // Get username from session
      const session = localStorage.getItem('travelAdminSession')
      if (!session) {
        router.push('/travel-admin/login')
        return
      }
      
      const parsed = JSON.parse(session)
      const username = parsed.username
      
      if (!username) {
        toast.error('Session tidak valid')
        router.push('/travel-admin/login')
        return
      }
      
      const response = await fetch(`/api/travel-admin/profile?username=${username}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const travel = result.data
        
        // Store original username for comparison
        setOriginalUsername(travel.username || '')
        
        setFormData({
          username: travel.username || '',
          name: travel.name || '',
          description: travel.description || '',
          logo: travel.logo || '',
          coverImage: travel.coverImage || '',
          address: travel.address || '',
          city: travel.city || '',
          phone: travel.phone || '',
          email: travel.email || '',
          website: travel.website || '',
          instagram: travel.instagram || '',
          rating: travel.rating || 4.5,
          totalReviews: travel.totalReviews || 0,
          totalJamaah: travel.totalJamaah || 0,
          yearEstablished: travel.yearEstablished || new Date().getFullYear(),
          licenses: travel.licenses ? travel.licenses.join(', ') : '',
          facilities: travel.facilities ? travel.facilities.join(', ') : '',
          services: travel.services ? travel.services.join(', ') : '',
          isActive: travel.isActive !== undefined ? travel.isActive : true
        })
        
        // Set previews for existing images
        if (travel.logo) setLogoPreview(travel.logo)
        if (travel.coverImage) setCoverPreview(travel.coverImage)
        
        // Set gallery previews
        if (travel.gallery && Array.isArray(travel.gallery)) {
          if (travel.gallery.length > 0 && typeof travel.gallery[0] === 'object') {
            // New format: [{url: string, caption: string}]
            setGalleryPreviews(travel.gallery.map((item: any) => item.url))
            setGalleryCaptions(travel.gallery.map((item: any) => item.caption || ''))
          } else {
            // Old format: [string, string, ...]
            setGalleryPreviews(travel.gallery)
            setGalleryCaptions(new Array(travel.gallery.length).fill(''))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch travel:', error)
      toast.error('Gagal memuat data travel')
    } finally {
      setFetching(false)
    }
  }
  
  useEffect(() => {
    fetchCities()
  }, [])
  
  const fetchCities = async () => {
    try {
      const response = await fetch('/api/settings?key=departureCities')
      const result = await response.json()
      
      if (result.success && result.data) {
        const citiesArray = result.data.value.split(',').map((c: string) => c.trim())
        setAvailableCities(citiesArray)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      setAvailableCities(['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'])
    }
  }
  
  const checkUsernameAvailability = async (username: string) => {
    // Reset states
    setUsernameError('')
    setUsernameAvailable(null)
    
    // Validate username format
    if (!username) {
      setUsernameError('Username tidak boleh kosong')
      return
    }
    
    if (username.length < 3) {
      setUsernameError('Username minimal 3 karakter')
      return
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('Username hanya boleh mengandung huruf, angka, underscore, dan dash')
      return
    }
    
    // If username is same as original, it's available
    if (username === originalUsername) {
      setUsernameAvailable(true)
      return
    }
    
    // Check availability
    setCheckingUsername(true)
    
    try {
      const response = await fetch(`/api/travels/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      
      if (result.available) {
        setUsernameAvailable(true)
      } else {
        setUsernameAvailable(false)
        setUsernameError('Username sudah digunakan')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameError('Gagal memeriksa ketersediaan username')
    } finally {
      setCheckingUsername(false)
    }
  }
  
  const handleUsernameChange = (value: string) => {
    setFormData({...formData, username: value})
    
    // Debounce username check
    if (value !== originalUsername) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameAvailable(true)
      setUsernameError('')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImageSrc(reader.result as string)
        setShowCoverCropModal(true)
      }
      reader.readAsDataURL(file)
    }
    
    // Reset input
    e.target.value = ''
  }
  
  const handleCoverCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], 'cover-image.jpg', { type: 'image/jpeg' })
    setCoverFile(croppedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(croppedFile)
    
    setShowCoverCropModal(false)
  }
  
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const MAX_GALLERY_IMAGES = 10
    
    // Check current total images (existing + new)
    const currentTotal = galleryPreviews.length
    
    if (currentTotal >= MAX_GALLERY_IMAGES) {
      toast.error(`Maksimal ${MAX_GALLERY_IMAGES} foto gallery. Hapus foto yang ada terlebih dahulu jika ingin menambah foto baru.`)
      e.target.value = ''
      return
    }
    
    const availableSlots = MAX_GALLERY_IMAGES - currentTotal
    const filesToAdd = files.slice(0, availableSlots)
    
    if (files.length > availableSlots) {
      toast.warning(`Hanya ${availableSlots} foto yang dapat ditambahkan. Maksimal total ${MAX_GALLERY_IMAGES} foto.`)
    }
    
    // Add new files
    setGalleryFiles([...galleryFiles, ...filesToAdd])
    
    // Create previews for new files
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string])
        setGalleryCaptions(prev => [...prev, ''])
      }
      reader.readAsDataURL(file)
    })
    
    e.target.value = ''
  }
  
  const removeGalleryImage = (index: number) => {
    const existingCount = galleryPreviews.length - galleryFiles.length
    
    if (index < existingCount) {
      // Removing existing image
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
      setGalleryCaptions(prev => prev.filter((_, i) => i !== index))
    } else {
      // Removing new upload
      const fileIndex = index - existingCount
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex))
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
      setGalleryCaptions(prev => prev.filter((_, i) => i !== index))
    }
  }
  
  const updateGalleryCaption = (index: number, caption: string) => {
    setGalleryCaptions(prev => {
      const newCaptions = [...prev]
      newCaptions[index] = caption
      return newCaptions
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate username before submitting
    if (formData.username !== originalUsername) {
      if (!usernameAvailable) {
        toast.error('Username tidak tersedia atau tidak valid')
        return
      }
    }
    
    setLoading(true)
    setUploading(true)

    try {
      let logoUrl = formData.logo
      let coverUrl = formData.coverImage

      // Upload new logo if file selected
      if (logoFile) {
        const logoFormData = new FormData()
        logoFormData.append('file', logoFile)
        logoFormData.append('type', 'logo')

        const logoResponse = await fetch('/api/upload/travel', {
          method: 'POST',
          body: logoFormData
        })

        const logoResult = await logoResponse.json()
        if (logoResult.success) {
          logoUrl = logoResult.url
        }
      }

      // Upload new cover image if file selected
      if (coverFile) {
        const coverFormData = new FormData()
        coverFormData.append('file', coverFile)
        coverFormData.append('type', 'cover')

        const coverResponse = await fetch('/api/upload/travel', {
          method: 'POST',
          body: coverFormData
        })

        const coverResult = await coverResponse.json()
        if (coverResult.success) {
          coverUrl = coverResult.url
        }
      }

      // Upload new gallery images
      const newGalleryUrls: string[] = []
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const galleryFormData = new FormData()
          galleryFormData.append('file', file)
          galleryFormData.append('type', 'gallery')

          const galleryResponse = await fetch('/api/upload/travel', {
            method: 'POST',
            body: galleryFormData
          })

          const galleryResult = await galleryResponse.json()
          if (galleryResult.success) {
            newGalleryUrls.push(galleryResult.url)
          }
        }
      }

      // Combine existing and new gallery with captions
      const existingCount = galleryPreviews.length - galleryFiles.length
      const galleryWithCaptions = galleryPreviews.map((preview, index) => {
        let url = preview
        
        // If this is a new upload, use the uploaded URL
        if (index >= existingCount) {
          const newIndex = index - existingCount
          if (newIndex < newGalleryUrls.length) {
            url = newGalleryUrls[newIndex]
          }
        }
        
        return {
          url: url,
          caption: galleryCaptions[index] || ''
        }
      })

      // Prepare travel data
      const travelData = {
        ...formData,
        originalUsername: originalUsername, // Send original username for identification
        logo: logoUrl,
        coverImage: coverUrl,
        gallery: galleryWithCaptions,
        licenses: formData.licenses.split(',').map(s => s.trim()).filter(Boolean),
        facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean)
      }

      const response = await fetch('/api/travel-admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(travelData)
      })

      const result = await response.json()

      if (result.success) {
        // If username changed, update session
        if (result.usernameChanged && result.newUsername) {
          const session = localStorage.getItem('travelAdminSession')
          if (session) {
            const parsed = JSON.parse(session)
            parsed.username = result.newUsername
            localStorage.setItem('travelAdminSession', JSON.stringify(parsed))
          }
        }
        
        toast.success('Profile berhasil diupdate!')
        router.push('/travel-admin/profile')
      } else {
        toast.error(result.message || 'Gagal update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Cover Image Crop Modal */}
      {showCoverCropModal && coverImageSrc && (
        <CoverCropModal
          image={coverImageSrc}
          onClose={() => {
            setShowCoverCropModal(false)
            setCoverImageSrc(null)
          }}
          onCropComplete={handleCoverCropComplete}
        />
      )}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/travel-admin/profile')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-600">Update informasi travel Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nama Travel *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Username *</label>
                <div className="relative">
                  <Input
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    required
                    className={
                      formData.username === originalUsername 
                        ? '' 
                        : usernameAvailable === true 
                          ? 'border-green-500' 
                          : usernameAvailable === false 
                            ? 'border-red-500' 
                            : ''
                    }
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!checkingUsername && formData.username !== originalUsername && usernameAvailable === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      ✓
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      ✗
                    </div>
                  )}
                </div>
                {usernameError && (
                  <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                )}
                {!usernameError && formData.username === originalUsername && (
                  <p className="text-xs text-gray-500 mt-1">Username saat ini</p>
                )}
                {!usernameError && formData.username !== originalUsername && usernameAvailable === true && (
                  <p className="text-xs text-green-600 mt-1">Username tersedia</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Deskripsi singkat tentang travel Anda"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tahun Berdiri</label>
                <Input
                  type="number"
                  value={formData.yearEstablished}
                  onChange={(e) => setFormData({...formData, yearEstablished: parseInt(e.target.value)})}
                  placeholder="2020"
                />
              </div>
            </div>
          </Card>

          {/* Logo Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Logo Travel</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="logoFile"
                  className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      {logoFile ? logoFile.name : 'Klik untuk upload logo'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP (Max 500KB) - Rekomendasi 200x200px</p>
                  </div>
                </label>
                <input
                  id="logoFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>

              {logoPreview && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Atau masukkan URL logo:</label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </div>
          </Card>

          {/* Cover Image Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Cover Image</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="coverFile"
                  className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      {coverFile ? coverFile.name : 'Klik untuk upload cover image'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP - Akan di-crop ke 1200 x 485 px</p>
                  </div>
                </label>
                <input
                  id="coverFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>

              {coverPreview && (
                <div className="relative aspect-[1200/485] w-full max-w-2xl border rounded-lg overflow-hidden">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Atau masukkan URL cover image:</label>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </Card>

          {/* Location & Contact */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Lokasi & Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kota</label>
                <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Alamat</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Alamat lengkap"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Telepon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="08123456789"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://www.example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Instagram</label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  placeholder="@namatravel atau https://instagram.com/namatravel"
                />
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Informasi Tambahan</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lisensi (pisahkan dengan koma)</label>
                <Textarea
                  value={formData.licenses}
                  onChange={(e) => setFormData({...formData, licenses: e.target.value})}
                  rows={2}
                  placeholder="PPIU 123/2024, IATA 456"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fasilitas (pisahkan dengan koma)</label>
                <Textarea
                  value={formData.facilities}
                  onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                  rows={2}
                  placeholder="Hotel Bintang 5, Bus AC, Makan 3x"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Layanan (pisahkan dengan koma)</label>
                <Textarea
                  value={formData.services}
                  onChange={(e) => setFormData({...formData, services: e.target.value})}
                  rows={2}
                  placeholder="Konsultasi Gratis, Antar Jemput, Handling"
                />
              </div>
            </div>
          </Card>

          {/* Gallery Images */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Gallery Images</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="galleryFiles"
                  className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      Klik untuk upload foto gallery
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP - Maksimal 10 foto</p>
                  </div>
                </label>
                <input
                  id="galleryFiles"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </div>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative border rounded-lg overflow-hidden">
                      <div className="aspect-video">
                        <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="p-2">
                        <Input
                          placeholder="Caption (opsional)"
                          value={galleryCaptions[index] || ''}
                          onChange={(e) => updateGalleryCaption(index, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Total foto: {galleryPreviews.length}/10
              </p>
            </div>
          </Card>

          {/* Status Travel */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Status Travel</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Status Travel
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Travel yang aktif akan ditampilkan di halaman publik
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/travel-admin/profile')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={loading || uploading}
            >
              <Save className="w-4 h-4 mr-2" />
              {uploading ? 'Mengupload...' : loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
