'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Calendar, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ArticleFavorite {
  id: string
  articleId: string
  createdAt: string
  article: {
    id: string
    slug: string
    title: string
    excerpt: string
    image: string
    tags: string
    views: number
    createdAt: string
    travel: {
      name: string
    } | null
    admin: {
      name: string
    } | null
  }
}

export default function FavoritArtikelPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<ArticleFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (isLoggedIn && user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      fetchFavorites(userData.id)
    } else {
      router.push('/login')
    }
  }

  const fetchFavorites = async (userId: string) => {
    try {
      const response = await fetch(`/api/articles/favorites?userId=${userId}`)
      const result = await response.json()
      
      if (result.success) {
        setFavorites(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (articleId: string) => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/articles/favorites?userId=${currentUser.id}&articleId=${articleId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Remove from list
        setFavorites(favorites.filter(fav => fav.articleId !== articleId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary">Artikel Favorit</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Memuat...' : `${favorites.length} artikel`}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto max-w-7xl px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-[16/10] bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => {
                const article = favorite.article
                const authorName = article.admin ? article.admin.name : (article.travel ? article.travel.name : 'Unknown')
                
                return (
                  <Card 
                    key={favorite.id} 
                    className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div 
                      onClick={() => router.push(`/artikel/${article.slug}`)}
                      className="relative"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <Image
                          src={article.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=Artikel'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Artikel'
                          }}
                        />
                        {/* Category Badge */}
                        {article.tags && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                              {article.tags.split(',')[0].trim()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(article.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-3">
                          Oleh: {authorName}
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <div className="px-4 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFavorite(article.id)
                        }}
                      >
                        <Heart className="w-4 h-4 mr-2 fill-red-500" />
                        Hapus dari Favorit
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Artikel Favorit</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Anda belum menyimpan artikel ke favorit. Mulai jelajahi artikel dan simpan yang menarik!
              </p>
              <Button onClick={() => router.push('/artikel')}>
                Jelajahi Artikel
              </Button>
            </div>
          )}
        </main>
      </div>
    </MobileLayout>
  )
}
