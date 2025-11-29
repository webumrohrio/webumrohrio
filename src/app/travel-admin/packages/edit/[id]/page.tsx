'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { CoverCropModal } from '@/components/cover-crop-modal'

// Helper function to format number to Rupiah currency
const formatCurrency = (value: number | string): string => {
  if (!value) return ''
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value
  if (isNaN(numValue)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue)
}

// Helper function to parse currency string to number
const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/\D/g, '')
  return cleaned ? parseInt(cleaned) : 0
}

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  
  // Image crop modal states
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    duration: '12 Hari',
    departureCity: '',
    departureDate: '',
    returnDate: '',
    quota: 45,
    quotaAvailable: 45,
    flightType: 'langsung',
    facilities: '',
    includes: '',
    excludes: '',
    isActive: true
  })

  const [priceOptions, setPriceOptions] = useState([
    {
      name: 'Paket Silver',
      price: 35000000,
      originalPrice: 40250000,
      cashback: 1000000,
      hotelMakkah: 'Hotel Bintang 4 (500m dari Masjidil Haram)',
      hotelMadinah: 'Hotel Bintang 4 (400m dari Masjid Nabawi)',
      description: 'Paket standar dengan lokasi strategis',
      isBestSeller: false
    }
  ])

  const [itinerary, setItinerary] = useState([
    {
      day: 1,
      title: 'Keberangkatan',
      description: 'Berkumpul di bandara dan penerbangan'
    }
  ])

  useEffect(() => {
    fetchPackage()
  }, [params.id])

  const fetchPackage = async () => {
    try {
      const response = await fetch(`/api/packages/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const pkg = result.data
        
        // Helper function to safely parse JSON
        const safeJsonParse = (value: any, fallback: any = []) => {
          if (!value) return fallback
          if (typeof value === 'object') return value // Already parsed
          try {
            return JSON.parse(value)
          } catch (e) {
            console.warn('Failed to parse JSON:', value)
            return fallback
          }
        }
        
        // Parse JSON fields safely
        const parsedPriceOptions = safeJsonParse(pkg.priceOptions, [])
        const parsedItinerary = safeJsonParse(pkg.itinerary, [])
        const parsedFacilities = safeJsonParse(pkg.facilities, [])
        const parsedIncludes = safeJsonParse(pkg.includes, [])
        const parsedExcludes = safeJsonParse(pkg.excludes, [])

        setFormData({
          name: pkg.name || '',
          description: pkg.description || '',
          image: pkg.image || '',
          duration: pkg.duration || '12 Hari',
          departureCity: pkg.departureCity || '',
          departureDate: pkg.departureDate?.split('T')[0] || '',
          returnDate: pkg.returnDate?.split('T')[0] || '',
          quota: pkg.quota || 45,
          quotaAvailable: pkg.quotaAvailable || pkg.quota || 45,
          flightType: pkg.flightType || 'langsung',
          facilities: parsedFacilities.join(', '),
          includes: parsedIncludes.join(', '),
          excludes: parsedExcludes.join(', '),
          isActive: pkg.isActive !== false
        })

        if (parsedPriceOptions.length > 0) {
          setPriceOptions(parsedPriceOptions)
        }

        if (parsedItinerary.length > 0) {
          setItinerary(parsedItinerary)
        }

        setImagePreview(pkg.image || '')
      }
    } catch (error) {
      console.error('Failed to fetch package:', error)
      toast.error('Gagal memuat data paket')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageSrc(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
    
    // Reset input
    e.target.value = ''
  }
  
  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], 'package-image.jpg', { type: 'image/jpeg' })
    setImageFile(croppedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(croppedFile)
    
    setShowCropModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    setUploading(true)

    try {
      let imageUrl = formData.image

      // Upload image if file selected
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload/package', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()
        if (uploadResult.success) {
          imageUrl = uploadResult.url
        } else {
          toast.error('Gagal upload gambar')
          setSaving(false)
          setUploading(false)
          return
        }
      }

      if (!imageUrl) {
        toast.error('Gambar paket harus diisi')
        setSaving(false)
        setUploading(false)
        return
      }

      // Find best seller option
      const bestSellerOption = priceOptions.find(opt => opt.isBestSeller)
      const isBestSeller = !!bestSellerOption

      const packageData = {
        ...formData,
        image: imageUrl,
        price: priceOptions[0]?.price || 0,
        cashback: priceOptions[0]?.cashback || 0,
        isBestSeller,
        facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
        includes: formData.includes.split(',').map(s => s.trim()).filter(Boolean),
        excludes: formData.excludes.split(',').map(s => s.trim()).filter(Boolean),
        priceOptions,
        itinerary
      }

      const response = await fetch(`/api/packages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/travel-admin/packages?status=success&action=updated')
      } else {
        const errorMessage = result.error || 'Gagal update paket'
        router.push(`/travel-admin/packages?status=error&message=${encodeURIComponent(errorMessage)}`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const addPriceOption = () => {
    setPriceOptions([...priceOptions, {
      name: '',
      price: 0,
      originalPrice: 0,
      cashback: 0,
      hotelMakkah: '',
      hotelMadinah: '',
      description: '',
      isBestSeller: false
    }])
  }

  const removePriceOption = (index: number) => {
    setPriceOptions(priceOptions.filter((_, i) => i !== index))
  }

  const addItinerary = () => {
    setItinerary([...itinerary, {
      day: itinerary.length + 1,
      title: '',
      description: ''
    }])
  }

  const removeItinerary = (index: number) => {
    const filtered = itinerary.filter((_, i) => i !== index)
    // Re-number the days sequentially
    const renumbered = filtered.map((item, idx) => ({
      ...item,
      day: idx + 1
    }))
    setItinerary(renumbered)
  }

  if (loading) {
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
      {/* Image Crop Modal */}
      {showCropModal && imageSrc && (
        <CoverCropModal
          image={imageSrc}
          onClose={() => {
            setShowCropModal(false)
            setImageSrc(null)
          }}
          onCropComplete={handleCropComplete}
        />
      )}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/travel-admin/packages')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Paket Umroh</h1>
            <p className="text-gray-600">Update informasi paket umroh</p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Nama Paket *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Umroh Premium Ramadhan 2025"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Deskripsi *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Deskripsi paket umroh"
                rows={3}
                required
              />
            </div>
            
            {/* Status Paket Toggle */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900 block mb-1">
                    Status Paket
                  </label>
                  <p className="text-xs text-gray-600">
                    {formData.isActive 
                      ? 'Paket ini aktif dan akan ditampilkan kepada pengguna' 
                      : 'Paket ini tidak aktif dan tidak akan ditampilkan kepada pengguna'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    formData.isActive 
                      ? 'bg-green-600 focus:ring-green-500' 
                      : 'bg-gray-300 focus:ring-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!formData.isActive && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-800 flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>Paket tidak aktif tidak akan muncul di pencarian dan halaman travel Anda</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Gambar Paket</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="imageFile"
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    {imageFile ? imageFile.name : 'Klik untuk upload gambar baru'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP (Max 5MB) - Rekomendasi 800x600px</p>
                </div>
              </label>
              <input
                id="imageFile"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {imagePreview && (
              <div className="relative aspect-video w-full max-w-md border rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label htmlFor="imageUrl" className="text-sm font-medium mb-2 block">Atau masukkan URL gambar</label>
              <Input
                id="imageUrl"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/package.jpg"
              />
            </div>
          </div>
        </Card>

        {/* Departure Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Informasi Keberangkatan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kota Keberangkatan *</label>
              <Input
                value={formData.departureCity}
                onChange={(e) => setFormData({...formData, departureCity: e.target.value})}
                placeholder="Jakarta"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Jenis Penerbangan *</label>
              <select
                value={formData.flightType}
                onChange={(e) => setFormData({...formData, flightType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="langsung">Langsung</option>
                <option value="transit">Transit</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Keberangkatan *</label>
              <Input
                type="date"
                value={formData.departureDate}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Tanggal keberangkatan tidak dapat diubah</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Durasi *</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="12 Hari"
                required
              />
            </div>
          </div>
        </Card>

        {/* Price Options */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Pilihan Paket</h3>
              <p className="text-sm text-gray-500">Harga pilihan pertama akan menjadi harga dasar di card paket</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addPriceOption}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pilihan
            </Button>
          </div>
          <div className="space-y-4">
            {priceOptions.map((option, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                      Harga Dasar
                    </span>
                  </div>
                )}
                {priceOptions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600"
                    onClick={() => removePriceOption(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nama Paket *</label>
                    <Input
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].name = e.target.value
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Paket Silver"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`bestSeller-${index}`}
                      checked={option.isBestSeller}
                      onCheckedChange={(checked) => {
                        const newOptions = priceOptions.map((opt, i) => ({
                          ...opt,
                          isBestSeller: i === index ? !!checked : false
                        }))
                        setPriceOptions(newOptions)
                      }}
                    />
                    <label htmlFor={`bestSeller-${index}`} className="text-sm font-medium cursor-pointer">
                      Best Seller
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Harga Setelah Diskon *</label>
                    <Input
                      type="text"
                      value={formatCurrency(option.price)}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].price = parseCurrency(e.target.value)
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Rp 35.000.000"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Harga Coret (Sebelum Diskon)</label>
                    <Input
                      type="text"
                      value={formatCurrency(option.originalPrice)}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].originalPrice = parseCurrency(e.target.value)
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Rp 40.250.000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Harga sebelum diskon (akan dicoret)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cashback</label>
                    <Input
                      type="text"
                      value={formatCurrency(option.cashback)}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].cashback = parseCurrency(e.target.value)
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Rp 1.000.000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cashback yang didapat jamaah</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hotel Makkah *</label>
                    <Input
                      value={option.hotelMakkah}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].hotelMakkah = e.target.value
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Hotel Bintang 4 (500m dari Masjidil Haram)"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hotel Madinah *</label>
                    <Input
                      value={option.hotelMadinah}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].hotelMadinah = e.target.value
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Hotel Bintang 4 (400m dari Masjid Nabawi)"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Deskripsi Paket</label>
                    <Input
                      value={option.description}
                      onChange={(e) => {
                        const newOptions = [...priceOptions]
                        newOptions[index].description = e.target.value
                        setPriceOptions(newOptions)
                      }}
                      placeholder="Paket standar dengan lokasi strategis"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Itinerary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Itinerary</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItinerary}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Hari
            </Button>
          </div>
          <div className="space-y-4">
            {itinerary.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                {itinerary.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600"
                    onClick={() => removeItinerary(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hari ke-{item.day}</label>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Judul</label>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const newItinerary = [...itinerary]
                        newItinerary[index].title = e.target.value
                        setItinerary(newItinerary)
                      }}
                      placeholder="Keberangkatan Jakarta - Jeddah"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deskripsi</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => {
                        const newItinerary = [...itinerary]
                        newItinerary[index].description = e.target.value
                        setItinerary(newItinerary)
                      }}
                      placeholder="Berkumpul di bandara dan penerbangan"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Facilities & Includes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Fasilitas & Termasuk</h3>
          <div className="space-y-4">
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
              <label className="text-sm font-medium mb-2 block">Termasuk dalam Paket (pisahkan dengan koma)</label>
              <Textarea
                value={formData.includes}
                onChange={(e) => setFormData({...formData, includes: e.target.value})}
                placeholder="Tiket pesawat PP, Hotel bintang 5, Makan 3x sehari"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tidak Termasuk (pisahkan dengan koma)</label>
              <Textarea
                value={formData.excludes}
                onChange={(e) => setFormData({...formData, excludes: e.target.value})}
                placeholder="Pengeluaran pribadi, Tips guide & driver"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/travel-admin/packages')}>
            Batal
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving || uploading}>
            <Save className="w-4 h-4 mr-2" />
            {uploading ? 'Mengupload...' : saving ? 'Menyimpan...' : 'Update Paket'}
          </Button>
        </div>
      </form>
    </div>
    </>
  )
}
