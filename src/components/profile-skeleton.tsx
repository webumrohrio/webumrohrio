'use client'

import { Card } from '@/components/ui/card'

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Profile Card Skeleton */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar Skeleton */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse flex-shrink-0" />
            
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-40 animate-pulse" />
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-28 animate-pulse" />
            </div>
          </div>

          {/* Contact Info Skeleton */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-12 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-48 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

      {/* Menu Items Skeleton */}
      <Card className="divide-y">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex-1 animate-pulse" />
            <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
          </div>
        ))}
      </Card>
    </div>
  )
}
