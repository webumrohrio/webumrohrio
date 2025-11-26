import { Card } from '@/components/ui/card'

export function TravelDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative w-full h-48 md:h-64 bg-gray-200" />

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Back Button Skeleton */}
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />

        {/* Travel Header Card */}
        <Card className="p-6 space-y-4">
          {/* Logo and Name */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto" />
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>

          {/* Licenses */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-full w-32" />
            ))}
          </div>
        </Card>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 border-b">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
