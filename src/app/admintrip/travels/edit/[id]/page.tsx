'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CoverCropModal } from '@/components/cover-crop-modal'

export default function EditTravelPage() {
  const router = useRouter()
  const params = useParams()
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
  
  // Cover image crop modal
  const [showCoverCropModal, setShowCoverCropModal] = useState(false)
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(null)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [originalUsername, setOriginalUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    fetchTravelData()
    fetchCities()
  }, [params.id])

  useEffect(() => {
    // Check username availability with debounce (only if username changed from original)
    if (formData.username && formData.username !== originalUsername && formData.username.length >= 3) {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout)
      }

      setUsernameStatus('checking')
      
      const timeout = setTimeout(() => {
        checkUsernameAvailability(formData.username)
      }, 500)

      setUsernameCheckTimeout(timeout)
    } else if (formData.username === originalUsername) {
      setUsernameStatus('idle')
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

  const fetchTravelData = async () => {
    console.log('🔄 fetchTravelData called')
    try {
      const response = await fetch(`/api/travels/id/${params.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const travel = result.data
        console.log('📥 Fetched travel data, packageLimit:', travel.packageLimit)
        
        // Save original username for comparison
        setOriginalUsername(travel.username || '')
        
        // Parse gallery data
        let galleryString = ''
        if (travel.gallery) {
          try {
            const galleryData = JSON.parse(travel.gallery)
            if (Array.isArray(galleryData)) {
              // Check if it's new format (array of objects) or old format (array of strings)
              if (galleryData.length > 0 && typeof galleryData[0] === 'object') {
                // New format: [{url: string, caption: string}] - extract URLs only
                galleryString = galleryData.map((item: any) => item.url).join(', ')
              } else {
                // Old format: [string, string, ...]
                galleryString = galleryData.join(', ')
              }
            }
          } catch (e) {
            console.error('Error parsing gallery:', e)
          }
        }
        
        // Parse JSON strings back to comma-separated
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
          licenses: travel.licenses ? JSON.parse(travel.licenses).join(', ') : '',
          facilities: travel.facilities ? JSON.parse(travel.facilities).join(', ') : '',
          services: travel.services ? JSON.parse(travel.services).join(', ') : '',
          gallery: galleryString,
          legalDocs: travel.legalDocs || '',
          isActive: travel.isActive !== undefined ? travel.isActive : true,
          isVerified: travel.isVerified !== undefined ? travel.isVerified : false,
          packageLimit: travel.packageLimit || 10
        })
        
        // Set previews for existing images
        if (travel.logo) setLogoPreview(travel.logo)
        if (travel.coverImage) setCoverPreview(travel.coverImage)
        if (travel.gallery) {
          const galleryData = JSON.parse(travel.gallery)
          
          // Check if it's new format (array of objects) or old format (array of strings)
          if (galleryData.length > 0 && typeof galleryData[0] === 'object') {
            // New format: [{url: string, caption: string}]
            setGalleryPreviews(galleryData.map((item: any) => item.url))
            setGalleryCaptions(galleryData.map((item: any) => item.caption || ''))
          } else {
            // Old format: [string, string, ...]
            setGalleryPreviews(galleryData)
            setGalleryCaptions(new Array(galleryData.length).fill(''))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch travel:', error)
      alert('Gagal memuat data travel')
    } finally {
      setFetching(false)
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
    
    // Check current total images (existing + new)
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
    // Remove from previews and captions
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    setGalleryCaptions(prev => prev.filter((_, i) => i !== index))
    
    // Check if this is an existing image or new upload
    const existingGalleryUrls = formData.gallery.split(',').map(s => s.trim()).filter(Boolean)
    
    if (index < existingGalleryUrls.length) {
      // Removing existing image - update formData.gallery
      const updatedGallery = existingGalleryUrls.filter((_, i) => i !== index)
      setFormData(prev => ({...prev, gallery: updatedGallery.join(', ')}))
    } else {
      // Removing new uploaded file
      const newFileIndex = index - existingGalleryUrls.length
      setGalleryFiles(prev => prev.filter((_, i) => i !== newFileIndex))
    }
  }

  const updateGalleryCaption = (index: number, caption: string) => {
    setGalleryCaptions(prev => {
      const newCaptions = [...prev]
      newCaptions[index] = caption
      return newCaptions
    })
  }

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || newPassword.length < 6) {
      alert('Password baru minimal 6 karakter')
      return
    }
    
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok')
      return
    }
    
    if (!confirm(`Yakin ingin reset password untuk ${formData.name}?\n\nPassword lama akan diganti dengan password baru.`)) {
      return
    }
    
    setResettingPassword(true)
    
    try {
      const response = await fetch(`/api/travels/id/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('✅ Password berhasil direset!\n\nInformasikan password baru kepada Travel Admin.')
        setShowPasswordReset(false)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert('❌ Gagal reset password: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Reset password error:', error)
      alert('❌ Terjadi kesalahan saat reset password')
    } finally {
      setResettingPassword(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 handleSubmit called with packageLimit:', formData.packageLimit)
    
    // Validate username if changed
    if (formData.username !== originalUsername && usernameStatus === 'taken') {
      alert('Username sudah digunakan oleh travel lain. Silakan gunakan username yang berbeda.')
      return
    }
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Already submitting, ignoring...')
      return
    }
    
    setLoading(true)
    setUploading(true)

    try {
      let logoUrl = formData.logo
      let coverUrl = formData.coverImage
      let galleryUrls: string[] = []

      // Upload logo if new file selected
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

      // Upload cover if new file selected
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
      const existingGalleryUrls = formData.gallery.split(',').map(s => s.trim()).filter(Boolean)
      const existingCount = existingGalleryUrls.length
      
      // Build gallery array with {url, caption} format
      const galleryWithCaptions = galleryPreviews.map((preview, index) => {
        let url = preview
        
        // If this is a new upload (index >= existingCount), use the uploaded URL
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
        logo: logoUrl,
        coverImage: coverUrl,
        gallery: galleryWithCaptions,
        licenses: formData.licenses.split(',').map(s => s.trim()).filter(Boolean),
        facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        legalDocs: formData.legalDocs ? JSON.parse(formData.legalDocs) : []
      }

      console.log('📤 Sending travelData:', {
        packageLimit: travelData.packageLimit,
        name: travelData.name
      })

      const response = await fetch(`/api/travels/id/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(travelData)
      })

      const result = await response.json()

      console.log('📥 Response received:', result.success)

      if (result.success) {
        console.log('✅ Update successful, redirecting...')
        alert('Travel berhasil diupdate!')
        router.push('/admintrip/travels')
      } else {
        console.log('❌ Update failed:', result.error)
        alert('Gagal mengupdate travel: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      console.log('🏁 Finally block, setting loading to false')
      setLoading(false)
      setUploading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat data...</p>
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
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Travel</h1>
            <p className="text-gray-600">Update data travel umroh</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info - Same as create but with values */}
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
                  <p className="text-xs text-red-600 font-medium">✗ Username sudah digunakan travel lain</p>
                )}
              </div>
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
                rows={3}
                required
                placeholder="Masukkan deskripsi travel (maksimal 150 karakter)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/150 karakter
              </p>
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
                      <p className="text-sm text-gray-600">
                        {logoFile ? logoFile.name : 'Klik untuk upload logo baru'}
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
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                placeholder="Atau masukkan URL logo"
                className="mt-2"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Cover Image</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label
                    htmlFor="coverFile"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {coverFile ? coverFile.name : 'Klik untuk upload cover baru'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP (Max 500KB)</p>
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
              <Input
                value={formData.coverImage}
                onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                placeholder="Atau masukkan URL cover"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Informasi Kontak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Telepon *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Alamat *</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
          </div>
        </Card>

        {/* Gallery */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Gallery Images</h3>
            <span className="text-sm text-muted-foreground">
              {galleryPreviews.length}/10 foto
            </span>
          </div>
          <div>
            <label
              htmlFor="galleryFiles"
              className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors mb-4 ${
                galleryPreviews.length >= 10 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                  : 'border-gray-300 cursor-pointer hover:border-primary hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {galleryPreviews.length >= 10 
                    ? 'Maksimal 10 foto tercapai' 
                    : 'Klik untuk upload gambar gallery tambahan'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP • Maksimal 500KB per file • Maksimal 10 foto
                </p>
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

            <Textarea
              value={formData.gallery}
              onChange={(e) => setFormData({...formData, gallery: e.target.value})}
              placeholder="Atau masukkan URL gallery (pisahkan dengan koma)"
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
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fasilitas (pisahkan dengan koma)</label>
              <Textarea
                value={formData.facilities}
                onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Layanan (pisahkan dengan koma)</label>
              <Textarea
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Status & Verification */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Status & Verifikasi</h3>
          <div className="space-y-4">
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

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <Label htmlFor="isVerified" className="text-sm font-medium text-blue-900">
                    Verifikasi Travel
                  </Label>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Travel yang terverifikasi akan menampilkan badge "Verified" di halaman detail
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
            {uploading ? 'Mengupload...' : loading ? 'Menyimpan...' : 'Update Travel'}
          </Button>
        </div>
      </form>
    </div>
    </>
  )
}
