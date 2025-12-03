'use client'

import { useEffect } from 'react'

interface ArticleViewTrackerProps {
  articleId: string
}

export function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    // Increment view count when component mounts
    const incrementView = async () => {
      try {
        await fetch(`/api/articles/${articleId}/view`, {
          method: 'POST'
        })
      } catch (error) {
        console.error('Failed to increment view count:', error)
      }
    }

    // Delay to avoid counting bot/crawler views
    const timer = setTimeout(() => {
      incrementView()
    }, 2000)

    return () => clearTimeout(timer)
  }, [articleId])

  return null // This component doesn't render anything
}
