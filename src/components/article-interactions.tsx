'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Share2, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ArticleInteractionsProps {
  articleId: string
  slug: string
  title: string
  excerpt: string
  author: string
  createdAt: string
  tags: string
  views: number
}

export function ArticleInteractions({ 
  articleId, 
  slug, 
  title, 
  excerpt,
  author,
  createdAt,
  tags,
  views
}: ArticleInteractionsProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      checkFavoriteStatus()
    }
  }, [currentUser, articleId])

  const loadCurrentUser = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (isLoggedIn && user) {
      const userData = JSON.parse(user)
      setCurrentUser({
        id: userData.id,
        name: userData.name || 'User'
      })
    }
  }

  const checkFavoriteStatus = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/articles/favorites?userId=${currentUser.id}&articleId=${articleId}`)
      const result = await response.json()
      
      if (result.success) {
        setIsFavorite(result.isFavorite)
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      setShowLoginModal(true)
      return
    }

    try {
      if (isFavorite) {
        const response = await fetch(`/api/articles/favorites?userId=${currentUser.id}&articleId=${articleId}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          setIsFavorite(false)
          setAlertMessage('Artikel dihapus dari favorit')
          setAlertType('error')
        }
      } else {
        const response = await fetch('/api/articles/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            articleId: articleId
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          setIsFavorite(true)
          setAlertMessage('Artikel berhasil disimpan ke favorit!')
          setAlertType('success')
        }
      }
      
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      setAlertMessage('Gagal mengubah status favorit')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleShare = () => {
    const shareText = `📰 *${title}*

✍️ ${author}
📅 ${createdAt}

${excerpt}

🔗 Baca Selengkapnya:
${window.location.href}

#Artikel #Umroh #TripBaitullah`

    const encodedText = encodeURIComponent(shareText)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Login Diperlukan</h3>
            
            <p className="text-center text-gray-600 mb-6">
              Silakan login terlebih dahulu untuk menyimpan artikel ke favorit Anda
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLoginModal(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  setShowLoginModal(false)
                  router.push('/login')
                }}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Alert */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm ${
            alertType === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            <p className="font-medium">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* Tags and Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {tags.split(',').map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag.trim()}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
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
      </div>
    </>
  )
}
