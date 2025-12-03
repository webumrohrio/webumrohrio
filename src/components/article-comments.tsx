'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Comment {
  id: string
  comment: string
  createdAt: string
  userId: string
  user: {
    name: string
    avatar?: string
  }
}

interface ArticleCommentsProps {
  articleId: string
}

export function ArticleComments({ articleId }: ArticleCommentsProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const commentsPerPage = 10

  useEffect(() => {
    loadCurrentUser()
    fetchComments()
  }, [articleId])

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
    }
  }

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles/comments?articleId=${articleId}`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      setShowLoginModal(true)
      return
    }
    
    if (!commentText.trim()) return
    
    try {
      const response = await fetch('/api/articles/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: articleId,
          userId: currentUser.id,
          comment: commentText.trim()
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCommentText('')
        setCurrentPage(1)
        await fetchComments()
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

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return
    
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return
    
    try {
      const response = await fetch(`/api/articles/comments?commentId=${commentId}&userId=${currentUser.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchComments()
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
              <User className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Login Diperlukan</h3>
            
            <p className="text-center text-gray-600 mb-6">
              Silakan login terlebih dahulu untuk menambahkan komentar
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

      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Komentar ({comments.length})</h2>
        
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
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
          {loading ? (
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
    </>
  )
}
