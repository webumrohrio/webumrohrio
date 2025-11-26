'use client'

import { Card } from '@/components/ui/card'

export function PackageCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 border border-border">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="px-2 pt-1.5 pb-2 space-y-1.5">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
        <div className="flex items-center gap-1 pb-1.5 border-b border-border/50">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex-1 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex-1 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-14 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex-1 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/20 rounded w-16 animate-pulse" />
        </div>
      </div>
    </Card>
  )
}

export function TravelCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border">
      <div className="p-3.5 md:p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 border border-border">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 animate-pulse" />
        <div className="flex items-center gap-3 pt-2">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-20 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-pulse" />
        </div>
      </div>
    </Card>
  )
}
