'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Video as VideoIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateVideoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    location: '',
    isActive: true
  })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/settings?key=departureCities')
      const result = await response.json()
      
      if (result.success && result.data) {
        const cityList = result.data.value.split(',').map((city: string) => city.trim())
        setCities(cityList)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  // Extract YouTube video ID from URL (supports regular videos and Shorts)
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    
    // Try multiple patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,  // Regular video
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,                    // Shorts
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,                     // Embed
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/                          // Old format
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  const videoId = getYouTubeVideoId(formData.youtubeUrl)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.youtubeUrl) {
      alert('Judul dan URL YouTube wajib diisi!')
      return
    }

    if (!videoId) {
      alert('URL YouTube tidak valid!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          youtubeUrl: formData.youtubeUrl,
          videoId: videoId,
          thumbnail: thumbnailUrl || '',
          location: formData.location || null,
          isActive: formData.isActive
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Video berhasil ditambahkan!')
        router.push('/admintrip/videos')
      } else {
        alert('Gagal menambahkan video: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating video:', error)
      alert('Gagal menambahkan video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Video</h1>
          <p className="text-gray-600">Tambahkan video panduan umroh baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Video</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">
                    Judul Video <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Panduan Lengkap Ibadah Umroh"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang video..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jelaskan secara singkat isi dari video
                  </p>
                </div>

                {/* YouTube URL */}
                <div>
                  <Label htmlFor="youtubeUrl">
                    URL YouTube <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan URL lengkap video YouTube
                  </p>
                  {formData.youtubeUrl && !videoId && (
                    <p className="text-xs text-red-500 mt-1">
                      URL YouTube tidak valid
                    </p>
                  )}
                  {videoId && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Video ID: {videoId}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Kota Keberangkatan</Label>
                  <Select
                    value={formData.location || 'all'}
                    onValueChange={(value) => setFormData({ ...formData, location: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kota keberangkatan (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Opsional - Video akan ditampilkan untuk kota tertentu. Pilih "Semua Kota" untuk menampilkan di semua kota.
                  </p>
                </div>
              </div>
            </Card>

            {/* Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Status Publikasi</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Status Video</Label>
                  <p className="text-sm text-gray-500">
                    Aktifkan untuk menampilkan video di website
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              
              {videoId ? (
                <div className="space-y-4">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {formData.title || 'Judul video...'}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {formData.description || 'Deskripsi video...'}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  {/* Embed Preview */}
                  <div>
                    <Label className="text-xs mb-2 block">Embed Preview:</Label>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <VideoIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Masukkan URL YouTube untuk melihat preview
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !videoId}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Video
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
