'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  videoId: string
  thumbnail: string
  isActive: boolean
}

export default function VideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [showFullscreenHint, setShowFullscreenHint] = useState(false)
  const [preferredLocation, setPreferredLocation] = useState<string>('')

  useEffect(() => {
    // Load preferred location from localStorage first
    const savedLocation = localStorage.getItem('preferredLocation')
    if (savedLocation) {
      setPreferredLocation(savedLocation)
    }
    
    fetchVideos(savedLocation || '')
  }, [])

  // Show fullscreen hint when video opens
  useEffect(() => {
    if (isVideoOpen) {
      const timer = setTimeout(() => {
        setShowFullscreenHint(true)
      }, 1000)

      const hideTimer = setTimeout(() => {
        setShowFullscreenHint(false)
      }, 6000)

      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    } else {
      setShowFullscreenHint(false)
    }
  }, [isVideoOpen])

  const fetchVideos = async (location: string = '') => {
    setLoading(true)
    try {
      const locationParam = location && location !== 'all' ? `?location=${location}` : ''
      const response = await fetch(`/api/videos${locationParam}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter only active videos
        const activeVideos = result.data.filter((v: Video) => v.isActive)
        setVideos(activeVideos)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#f7f9fa]">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary">Video</h1>
              <p className="text-xs text-muted-foreground">
                {videos.length} video tersedia
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-3">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video) => (
                <div 
                  key={video.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedVideo(video)
                    setIsVideoOpen(true)
                  }}
                >
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Play className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Video</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Belum ada video yang tersedia saat ini. Silakan cek kembali nanti.
              </p>
            </div>
          )}
        </div>

        {/* Video Popup Dialog */}
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0">
            <DialogTitle className="sr-only">
              {selectedVideo?.title || 'Video Player'}
            </DialogTitle>
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              {/* Video Player */}
              {selectedVideo && (
                <div className="relative aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&fs=1&color=white`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              )}
              
              {/* Fullscreen Hint - Below Video */}
              {showFullscreenHint && selectedVideo && (
                <div className="bg-gray-900 px-4 py-3 border-t border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-sm font-medium text-white">Klik icon fullscreen untuk pengalaman terbaik</span>
                    </div>
                    <button
                      onClick={() => setShowFullscreenHint(false)}
                      className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Video Info */}
              {selectedVideo && (
                <div className="bg-gray-900 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300">
                    {selectedVideo.description}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  )
}
