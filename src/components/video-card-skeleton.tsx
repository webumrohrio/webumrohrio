'use client'

import { Card } from '@/components/ui/card'

export function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border">
      <div className="relative aspect-video bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 animate-pulse" />
      </div>
    </Card>
  )
}
