'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditSliderPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    targetCity: 'all',
    order: 0,
    isActive: true,
    showOverlay: true,
    objectFit: 'cover'
  })

  useEffect(() => {
    fetchSliderData()
    fetchCities()
  }, [params.id])

  const fetchSliderData = async () => {
    try {
      const response = await fetch(`/api/sliders/${params.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const slider = result.data
        setFormData({
          title: slider.title || '',
          description: slider.description || '',
          image: slider.image || '',
          link: slider.link || '',
          targetCity: slider.targetCity || 'all',
          order: slider.order || 0,
          isActive: slider.isActive !== undefined ? slider.isActive : true,
          showOverlay: slider.showOverlay !== undefined ? slider.showOverlay : true,
          objectFit: slider.objectFit || 'cover'
        })
        
        if (slider.image) {
          setImagePreview(slider.image)
        }
      }
    } catch (error) {
      console.error('Failed to fetch slider:', error)
      alert('Gagal memuat data slider')
    } finally {
      setFetching(false)
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
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUploading(true)

    try {
      let imageUrl = formData.image

      // Upload new image if file selected
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload/slider', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()
        if (uploadResult.success) {
          imageUrl = uploadResult.url
        } else {
          alert('Gagal upload gambar')
          return
        }
      }

      if (!imageUrl) {
        alert('Gambar slider harus diisi')
        return
      }

      const sliderData = {
        ...formData,
        image: imageUrl,
        targetCity: formData.targetCity === 'all' ? null : formData.targetCity
      }

      const response = await fetch(`/api/sliders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sliderData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Slider berhasil diupdate!')
        router.push('/admintrip/sliders')
      } else {
        alert('Gagal mengupdate slider: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Slider</h1>
          <p className="text-gray-600">Update slider banner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Informasi Slider</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Promo Umroh Ramadan"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Deskripsi singkat slider"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="https://example.com/promo"
              />
              <p className="text-xs text-gray-500 mt-1">Link tujuan ketika slider diklik</p>
            </div>

            <div>
              <Label htmlFor="order">Urutan</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Urutan tampil slider (semakin kecil semakin awal)</p>
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Gambar Slider</h3>
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
                  <p className="text-xs text-gray-500">PNG, JPG, WebP (Max 5MB) - Rekomendasi 1200x400px</p>
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
              <div className="relative aspect-video w-full max-w-2xl border rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <Label htmlFor="imageUrl">Atau masukkan URL gambar</Label>
              <Input
                id="imageUrl"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/slider.jpg"
              />
            </div>
          </div>
        </Card>

        {/* Target City */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Target Kota</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetCity">Tampilkan di Kota</Label>
              <Select 
                value={formData.targetCity} 
                onValueChange={(value) => setFormData({...formData, targetCity: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Slider akan ditampilkan sesuai lokasi yang dipilih user
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isActive">Status Aktif</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Slider yang aktif akan ditampilkan di homepage
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="showOverlay">Tampilkan Overlay Gelap</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Gradasi hitam di bagian bawah slider untuk meningkatkan keterbacaan teks
                </p>
              </div>
              <Switch
                id="showOverlay"
                checked={formData.showOverlay}
                onCheckedChange={(checked) => setFormData({...formData, showOverlay: checked})}
              />
            </div>

            <div>
              <Label htmlFor="objectFit">Mode Tampilan Gambar</Label>
              <Select 
                value={formData.objectFit} 
                onValueChange={(value) => setFormData({...formData, objectFit: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (Penuh, mungkin terpotong)</SelectItem>
                  <SelectItem value="contain">Contain (Tampil semua, mungkin ada space)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Cover: Gambar mengisi penuh container, bagian tepi mungkin terpotong<br />
                Contain: Gambar ditampilkan utuh tanpa terpotong, mungkin ada space kosong
              </p>
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
            {uploading ? 'Mengupload...' : loading ? 'Menyimpan...' : 'Update Slider'}
          </Button>
        </div>
      </form>
    </div>
  )
}
