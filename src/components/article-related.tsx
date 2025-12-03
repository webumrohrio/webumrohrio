'use client'

import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface RelatedArticle {
  id: string
  slug: string
  title: string
  image: string
  createdAt: string
}

interface ArticleRelatedProps {
  currentArticleId: string
  tags: string
}

export function ArticleRelated({ currentArticleId, tags }: ArticleRelatedProps) {
  const router = useRouter()
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedArticles()
  }, [currentArticleId])

  const fetchRelatedArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles?limit=4`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter out current article and limit to 2
        const related = result.data
          .filter((a: any) => a.id !== currentArticleId)
          .slice(0, 2)
        setRelatedArticles(related)
      }
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Artikel Terkait</h2>
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
      </Card>
    )
  }

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4">Artikel Terkait</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedArticles.map((article) => (
          <div 
            key={article.id} 
            className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => router.push(`/artikel/${article.slug}`)}
          >
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={article.image || 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image'}
                alt={article.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image'
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(article.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
