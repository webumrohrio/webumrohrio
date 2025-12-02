'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { ArticleSEO } from '@/components/article-seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArticleDetailSkeleton } from '@/components/article-detail-skeleton'
import { ArrowLeft, Calendar, User, Eye, Share2, Heart, ArrowUp, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface ArticleDetail {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  image: string
  tags: string
  views: number
  createdAt: string
  travelName: string
  author: string
}

export default function DetailArtikel() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalType, setLoginModalType] = useState<'favorite' | 'comment'>('favorite')
  const [readProgress, setReadProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const commentsPerPage = 10
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    fetchArticleDetail()
    loadCurrentUser()
  }, [params.slug])

  useEffect(() => {
    if (article) {
      // Always fetch comments regardless of login status
      fetchComments()
      fetchRelatedArticles()
      
      // Only check favorite status if user is logged in
      if (currentUser) {
        checkFavoriteStatus()
      }
    }
  }, [article, currentUser])

  const loadCurrentUser = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = localStorage.getItem('currentUser')
    
    if (isLoggedIn && user) {
      const userData = JSON.parse(user)
      setCurrentUser({
        id: userData.id,
        name: userData.name || 'User',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=10b981&color=fff`
      })
    } else {
      setCurrentUser(null)
    }
  }

  const checkFavoriteStatus = async () => {
    if (!currentUser || !article) return
    
    try {
      const response = await fetch(`/api/articles/favorites?userId=${currentUser.id}&articleId=${article.id}`)
      const result = await response.json()
      
      if (result.success) {
        setIsFavorite(result.isFavorite)
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
  }

  const fetchComments = async () => {
    if (!article) return
    
    setLoadingComments(true)
    try {
      const response = await fetch(`/api/articles/comments?articleId=${article.id}`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchRelatedArticles = async () => {
    if (!article) return
    
    setLoadingRelated(true)
    try {
      // Fetch articles with same tags, excluding current article
      const response = await fetch(`/api/articles?limit=4`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter out current article and limit to 2
        const related = result.data
          .filter((a: any) => a.id !== article.id)
          .slice(0, 2)
        setRelatedArticles(related)
      }
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      
      // Calculate read progress
      const scrollableHeight = documentHeight - windowHeight
      const progress = (scrollTop / scrollableHeight) * 100
      setReadProgress(Math.min(progress, 100))
      
      // Show scroll to top button after scrolling 300px
      setShowScrollTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Convert line breaks to HTML
  const formatContent = (content: string) => {
    // Handle different line break formats: \r\n (Windows), \n (Unix), \r (old Mac)
    return content
      .replace(/\r\n/g, '<br />')
      .replace(/\n/g, '<br />')
      .replace(/\r/g, '<br />')
  }

  const fetchArticleDetail = async () => {
    try {
      const response = await fetch(`/api/articles?slug=${params.slug}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data
        // Determine author name: use admin name if available, otherwise use travel name
        const authorName = data.admin ? data.admin.name : (data.travel ? data.travel.name : 'Unknown')
        const travelName = data.travel ? data.travel.name : (data.admin ? data.admin.name : 'Unknown')
        
        setArticle({
          id: data.id,
          slug: data.slug,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          image: data.image,
          tags: data.tags,
          views: data.views,
          createdAt: new Date(data.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          travelName: travelName,
          author: authorName
        })
      } else {
        // Article not found
        setArticle(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch article:', error)
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!currentUser) {
      setLoginModalType('comment')
      setShowLoginModal(true)
      return
    }
    
    if (!article || !commentText.trim()) return
    
    try {
      const response = await fetch('/api/articles/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId: article.id,
          userId: currentUser.id,
          comment: commentText.trim()
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCommentText('')
        setCurrentPage(1)
        await fetchComments() // Reload comments
        setAlertMessage('Komentar berhasil ditambahkan!')
        setAlertType('success')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      } else {
        setAlertMessage('Gagal menambahkan komentar')
        setAlertType('error')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      setAlertMessage('Gagal menambahkan komentar')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleToggleFavorite = async () => {
    // Check if user is logged in
    if (!currentUser) {
      setLoginModalType('favorite')
      setShowLoginModal(true)
      return
    }

    if (!article) return

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/articles/favorites?userId=${currentUser.id}&articleId=${article.id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          setIsFavorite(false)
          setAlertMessage('Artikel dihapus dari favorit')
          setAlertType('error')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/articles/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: currentUser.id,
            articleId: article.id
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

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return
    
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return
    
    try {
      const response = await fetch(`/api/articles/comments?commentId=${commentId}&userId=${currentUser.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchComments() // Reload comments
        setAlertMessage('Komentar berhasil dihapus')
        setAlertType('success')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      } else {
        setAlertMessage(result.message || 'Gagal menghapus komentar')
        setAlertType('error')
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      setAlertMessage('Gagal menghapus komentar')
      setAlertType('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleShare = () => {
    if (!article) return

    // Create share text with emoticons
    const shareText = `📰 *${article.title}*

✍️ ${article.author}
📅 ${article.createdAt}

${article.excerpt}

🔗 Baca Selengkapnya:
${window.location.href}

#Artikel #Umroh #TripBaitullah`

    // Encode text for WhatsApp URL
    const encodedText = encodeURIComponent(shareText)
    
    // Open WhatsApp with pre-filled text
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    
    // Open in new window/tab
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <MobileLayout hideBottomNav>
        <ArticleDetailSkeleton />
      </MobileLayout>
    )
  }

  if (!article) {
    return (
      <MobileLayout hideBottomNav>
        <div className="min-h-screen flex items-center justify-center">
          <p>Artikel tidak ditemukan</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout hideBottomNav>
      {/* SEO Component */}
      {article && <ArticleSEO article={article} />}
      
      <div className="min-h-screen bg-gray-50">
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">Login Diperlukan</h3>
              
              {/* Message */}
              <p className="text-center text-gray-600 mb-6">
                {loginModalType === 'favorite' 
                  ? 'Silakan login terlebih dahulu untuk menyimpan artikel ke favorit Anda'
                  : 'Silakan login terlebih dahulu untuk menambahkan komentar'
                }
              </p>
              
              {/* Buttons */}
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

        {/* Header with Progress Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/artikel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Detail Artikel</h1>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${readProgress}%` }}
            />
          </div>
        </header>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
            size="icon"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={article.image}
              alt={`${article.title} - Artikel Umroh oleh ${article.travelName}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          {/* Article Info */}
          <Card className="p-4 md:p-6">
            {/* Tags and Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
              
              {/* Action Buttons */}
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

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{article.travelName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{article.createdAt}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>5 menit baca</span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
          </Card>

          {/* Comments Section */}
          <Card className="p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">Komentar ({comments.length})</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                {/* User Avatar */}
                {currentUser ? (
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                
                {/* Comment Input */}
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      const text = e.target.value
                      if (text.length <= 60) {
                        setCommentText(text)
                      }
                    }}
                    placeholder={currentUser ? `Tulis komentar sebagai ${currentUser.name}...` : "Tulis komentar Anda..."}
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    maxLength={60}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${commentText.length >= 60 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                      {commentText.length}/60 karakter
                    </span>
                    <Button type="submit" disabled={!commentText.trim()}>
                      Kirim Komentar
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {loadingComments ? (
                <div className="text-center py-8 text-muted-foreground">
                  Memuat komentar...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              ) : (
                comments
                  .slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
                  .map((comment) => {
                    const commentDate = new Date(comment.createdAt)
                    const now = new Date()
                    const diffMs = now.getTime() - commentDate.getTime()
                    const diffMins = Math.floor(diffMs / 60000)
                    const diffHours = Math.floor(diffMs / 3600000)
                    const diffDays = Math.floor(diffMs / 86400000)
                    
                    let timeAgo = ''
                    if (diffMins < 1) timeAgo = 'Baru saja'
                    else if (diffMins < 60) timeAgo = `${diffMins} menit yang lalu`
                    else if (diffHours < 24) timeAgo = `${diffHours} jam yang lalu`
                    else if (diffDays < 7) timeAgo = `${diffDays} hari yang lalu`
                    else timeAgo = commentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    
                    const avatar = comment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=10b981&color=fff`
                    
                    const isOwnComment = currentUser && comment.userId === currentUser.id
                    
                    return (
                      <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden">
                          <Image
                            src={avatar}
                            alt={comment.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo}</span>
                            </div>
                            {isOwnComment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {/* Pagination */}
            {comments.length > commentsPerPage && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Menampilkan {((currentPage - 1) * commentsPerPage) + 1} - {Math.min(currentPage * commentsPerPage, comments.length)} dari {comments.length} komentar
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(comments.length / commentsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(comments.length / commentsPerPage)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Related Articles */}
          <Card className="p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">Artikel Terkait</h2>
            {loadingRelated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-lg animate-pulse">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : relatedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id} 
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/artikel/${relatedArticle.slug}`)}
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={relatedArticle.image || 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image'}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(relatedArticle.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada artikel terkait
              </p>
            )}
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
