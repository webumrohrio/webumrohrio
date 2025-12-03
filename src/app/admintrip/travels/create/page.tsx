'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CoverCropModal } from '@/components/cover-crop-modal'

export default function CreateTravelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    password: '',
    website: '',
    instagram: '',
    rating: 4.5,
    totalReviews: 0,
    totalJamaah: 0,
    yearEstablished: new Date().getFullYear(),
    licenses: '',
    facilities: '',
    services: '',
    gallery: '',
    legalDocs: '',
    isActive: true,
    isVerified: false,
    packageLimit: 10
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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Cover image crop modal
  const [showCoverCropModal, setShowCoverCropModal] = useState(false)
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(null)

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    // Check username availability with debounce
    if (formData.username.length >= 3) {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout)
      }

      setUsernameStatus('checking')
      
      const timeout = setTimeout(() => {
        checkUsernameAvailability(formData.username)
      }, 500)

      setUsernameCheckTimeout(timeout)
    } else {
      setUsernameStatus('idle')
    }

    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout)
      }
    }
  }, [formData.username])

  const checkUsernameAvailability = async (username: string) => {
    try {
      const response = await fetch(`/api/travels/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      
      if (result.success) {
        setUsernameStatus(result.available ? 'available' : 'taken')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameStatus('idle')
    }
  }

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
      // Fallback cities
      setAvailableCities(['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'])
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const MAX_FILE_SIZE = 500 * 1024 // 500KB in bytes
    
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`Ukuran file logo terlalu besar (${(file.size / 1024).toFixed(0)}KB).\nMaksimal ukuran file adalah 500KB.\nSilakan kompres atau pilih file yang lebih kecil.`)
        e.target.value = '' // Reset input
        return
      }
      
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
    const MAX_FILE_SIZE = 500 * 1024 // 500KB in bytes
    
    // Check current total images
    const currentTotal = galleryPreviews.length
    
    if (currentTotal >= MAX_GALLERY_IMAGES) {
      alert(`Maksimal ${MAX_GALLERY_IMAGES} foto gallery. Hapus foto yang ada terlebih dahulu jika ingin menambah foto baru.`)
      e.target.value = '' // Reset input
      return
    }
    
    // Check how many more images can be added
    const remainingSlots = MAX_GALLERY_IMAGES - currentTotal
    
    if (files.length > remainingSlots) {
      alert(`Anda hanya bisa menambah ${remainingSlots} foto lagi. Total maksimal adalah ${MAX_GALLERY_IMAGES} foto.`)
      e.target.value = '' // Reset input
      return
    }
    
    // Validate each file
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (${(file.size / 1024).toFixed(0)}KB - melebihi 500KB)`)
      } else {
        validFiles.push(file)
      }
    })
    
    // Show error if there are invalid files
    if (invalidFiles.length > 0) {
      alert(`File berikut melebihi ukuran maksimal 500KB:\n\n${invalidFiles.join('\n')}\n\nSilakan kompres atau pilih file yang lebih kecil.`)
      e.target.value = '' // Reset input
      return
    }
    
    // Add valid files
    if (validFiles.length > 0) {
      setGalleryFiles(prev => [...prev, ...validFiles])
      
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string])
          setGalleryCaptions(prev => [...prev, '']) // Add empty caption for new image
        }
        reader.readAsDataURL(file)
      })
    }
    
    e.target.value = '' // Reset input for next selection
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    setGalleryCaptions(prev => prev.filter((_, i) => i !== index))
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
    setLoading(true)
    setUploading(true)

    try {
      let logoUrl = formData.logo
      let coverUrl = formData.coverImage
      let galleryUrls: string[] = []

      // Upload logo if file selected
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

      // Upload cover image if file selected
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

      // Upload gallery images
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
            galleryUrls.push(galleryResult.url)
          }
        }
      }

      // Add existing gallery URLs from text input
      if (formData.gallery) {
        const existingUrls = formData.gallery.split(',').map(s => s.trim()).filter(Boolean)
        galleryUrls = [...galleryUrls, ...existingUrls]
      }

      // Build gallery array with {url, caption} format
      const galleryWithCaptions = galleryUrls.map((url, index) => ({
        url: url,
        caption: galleryCaptions[index] || ''
      }))

      // Convert comma-separated strings to arrays
      const travelData = {
        ...formData,
        logo: logoUrl,
        coverImage: coverUrl,
        gallery: galleryWithCaptions,
        licenses: formData.licenses.split(',').map(s => s.trim()).filter(Boolean),
        facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        legalDocs: formData.legalDocs ? JSON.parse(formData.legalDocs) : []
      }

      console.log('📤 Creating travel with packageLimit:', travelData.packageLimit)

      const response = await fetch('/api/travels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(travelData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Travel berhasil ditambahkan!')
        router.push('/admintrip/travels')
      } else {
        alert('Gagal menambahkan travel: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
      setUploading(false)
    }
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
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tambah Travel</h1>
            <p className="text-gray-600">Tambahkan data travel umroh baru</p>
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
                placeholder="Contoh: Safira Travel"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Username *</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                placeholder="Contoh: safira-travel"
                required
                className={
                  usernameStatus === 'available' ? 'border-green-500' :
                  usernameStatus === 'taken' ? 'border-red-500' : ''
                }
              />
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-500">URL: /{formData.username || 'username'}</p>
                {usernameStatus === 'checking' && (
                  <p className="text-xs text-gray-500">Mengecek ketersediaan username...</p>
                )}
                {usernameStatus === 'available' && formData.username.length >= 3 && (
                  <p className="text-xs text-green-600 font-medium">✓ Username dapat digunakan</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-600 font-medium">✗ Username sudah ada yang gunakan</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Kota *</label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData({...formData, city: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kota keberangkatan" />
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
              <label className="text-sm font-medium mb-2 block">Tahun Berdiri</label>
              <Input
                type="number"
                value={formData.yearEstablished}
                onChange={(e) => setFormData({...formData, yearEstablished: parseInt(e.target.value) || new Date().getFullYear()})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Deskripsi *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 150) {
                    setFormData({...formData, description: e.target.value})
                  }
                }}
                maxLength={150}
                placeholder="Masukkan deskripsi travel (maksimal 150 karakter)"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/150 karakter
              </p>
            </div>

            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Logo Travel</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label
                    htmlFor="logoFile"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {logoFile ? logoFile.name : 'Klik untuk upload logo'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP (Max 500KB)</p>
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
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Atau masukkan URL logo:</p>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                placeholder="https://example.com/logo.jpg"
                className="mt-1"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Cover Image / Gambar Sampul</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label
                    htmlFor="coverFile"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {coverFile ? coverFile.name : 'Klik untuk upload cover image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP - Akan di-crop ke 1200 x 485 px</p>
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
                  <div className="w-48 h-32 border rounded-lg overflow-hidden">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Atau masukkan URL cover image:</p>
              <Input
                value={formData.coverImage}
                onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                placeholder="https://example.com/cover.jpg"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Informasi Kontak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="info@safira.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password Login *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password untuk login Travel Admin. Minimal 6 karakter.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Telepon</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+62 61 9876543"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://safira.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Instagram</label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder="@safiratravel atau https://instagram.com/safiratravel"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Alamat</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Jl. Gatot Subroto No. 789, Medan"
              />
            </div>
          </div>
        </Card>

        {/* Gallery Images */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Gallery Images</h3>
            <span className="text-sm text-muted-foreground">
              {galleryPreviews.length}/10 foto
            </span>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Gallery Images</label>
            <div className="mb-4">
              <label
                htmlFor="galleryFiles"
                className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                  galleryPreviews.length >= 10 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                    : 'border-gray-300 cursor-pointer hover:border-primary hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {galleryPreviews.length >= 10 
                      ? 'Maksimal 10 foto tercapai' 
                      : 'Klik untuk upload gambar gallery (bisa multiple)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP • Maksimal 500KB per file • Maksimal 10 foto</p>
                </div>
              </label>
              <input
                id="galleryFiles"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleGalleryChange}
                className="hidden"
                multiple
                disabled={galleryPreviews.length >= 10}
              />
            </div>
            
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="relative group">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Keterangan Foto (Opsional)
                      </label>
                      <Input
                        value={galleryCaptions[index] || ''}
                        onChange={(e) => updateGalleryCaption(index, e.target.value)}
                        placeholder="Contoh: Kantor Pusat Jakarta"
                        className="text-sm"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {(galleryCaptions[index] || '').length}/100 karakter
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mb-2">Atau masukkan URL gallery (pisahkan dengan koma):</p>
            <Textarea
              value={formData.gallery}
              onChange={(e) => setFormData({...formData, gallery: e.target.value})}
              placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
              rows={2}
            />
          </div>
        </Card>



        {/* Licenses & Services */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Lisensi & Layanan</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Lisensi (pisahkan dengan koma)</label>
              <Input
                value={formData.licenses}
                onChange={(e) => setFormData({...formData, licenses: e.target.value})}
                placeholder="PPIU: 123/2020, IATA: 12345678"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fasilitas (pisahkan dengan koma)</label>
              <Textarea
                value={formData.facilities}
                onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                placeholder="Hotel Bintang 5, Transportasi AC, Makan 3x Sehari"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Layanan (pisahkan dengan koma)</label>
              <Textarea
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
                placeholder="Konsultasi Gratis, Pendaftaran Online, Cicilan 0%"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Status & Verifikasi */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Status & Verifikasi</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isActive">Status Travel</Label>
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

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <Label htmlFor="isVerified" className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verifikasi Travel
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Travel yang terverifikasi akan menampilkan badge "verified" di halaman detail
                </p>
              </div>
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData({...formData, isVerified: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Package Limit */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📦 Batas Paket Umroh</h2>
          <div className="space-y-4">
            <div>
              <Label>Jumlah Maksimal Paket</Label>
              <p className="text-sm text-gray-500 mb-3">
                Tentukan berapa banyak paket umroh yang dapat ditambahkan oleh travel ini
              </p>
              <div className="flex flex-wrap gap-2">
                {[2, 4, 6, 8, 10, 15, 20].map((limit) => (
                  <Button
                    key={limit}
                    type="button"
                    variant={formData.packageLimit === limit ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, packageLimit: limit })}
                    className="min-w-[60px]"
                  >
                    {limit}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={formData.packageLimit === 999 ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, packageLimit: 999 })}
                  className="min-w-[100px]"
                >
                  Unlimited
                </Button>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Terpilih:</strong> Travel ini dapat menambahkan maksimal{' '}
                  <span className="font-bold">
                    {formData.packageLimit === 999 ? 'unlimited' : formData.packageLimit}
                  </span>{' '}
                  paket umroh
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={loading || uploading}
          >
            <Save className="w-4 h-4 mr-2" />
            {uploading ? 'Mengupload...' : loading ? 'Menyimpan...' : 'Simpan Travel'}
          </Button>
        </div>
      </form>
    </div>
    </>
  )
}
