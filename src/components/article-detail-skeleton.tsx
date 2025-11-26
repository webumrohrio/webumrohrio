import { Card } from '@/components/ui/card'

export function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Article Header */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-full w-20" />
            ))}
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative w-full aspect-video bg-gray-200 rounded-xl" />

        {/* Article Content */}
        <Card className="p-6 space-y-4">
          {/* Paragraphs */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <div className="h-12 bg-gray-200 rounded-lg flex-1" />
          <div className="h-12 bg-gray-200 rounded-lg w-12" />
          <div className="h-12 bg-gray-200 rounded-lg w-12" />
        </div>

        {/* Related Articles */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
