'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Video as VideoIcon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  videoId: string
  thumbnail: string
  location: string | null
  isActive: boolean
  createdAt: string
}

export default function VideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Load videos from API
  useEffect(() => {
    fetchVideos()

    // Reload when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchVideos()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', fetchVideos)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', fetchVideos)
    }
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      const result = await response.json()
      
      if (result.success) {
        setVideos(result.data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus video "${title}"?`)) {
      try {
        const response = await fetch(`/api/videos?id=${id}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (result.success) {
          setVideos(videos.filter(v => v.id !== id))
          alert('Video berhasil dihapus')
        } else {
          alert('Gagal menghapus video')
        }
      } catch (error) {
        console.error('Error deleting video:', error)
        alert('Gagal menghapus video')
      }
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(search.toLowerCase()) ||
    video.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Video</h1>
          <p className="text-gray-600">Kelola video panduan umroh</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => router.push('/admintrip/videos/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Video
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari video..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <VideoIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Video</p>
              <p className="text-2xl font-bold">{videos.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Video Aktif</p>
              <p className="text-2xl font-bold">{videos.filter(v => v.isActive).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <VideoIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Video Nonaktif</p>
              <p className="text-2xl font-bold">{videos.filter(v => !v.isActive).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat video...</p>
          </div>
        </div>
      ) : filteredVideos.length === 0 ? (
        /* Empty State */
        <Card className="p-12">
          <div className="text-center">
            <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tidak ada video
            </h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Tidak ada video yang sesuai dengan pencarian' : 'Belum ada video yang ditambahkan'}
            </p>
            {!search && (
              <Button onClick={() => router.push('/admintrip/videos/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Video Pertama
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Video Table */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul & Deskripsi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kota
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    {/* Thumbnail */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="relative w-32 aspect-video bg-gray-200 rounded overflow-hidden group cursor-pointer"
                           onClick={() => window.open(video.youtubeUrl, '_blank')}>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <p className="font-semibold text-gray-800 line-clamp-2 mb-1">
                          {video.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {video.description || '-'}
                        </p>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {video.location || 'Semua Kota'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {video.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(video.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admintrip/videos/${video.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(video.id, video.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
