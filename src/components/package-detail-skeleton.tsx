import { Card } from '@/components/ui/card'

export function PackageDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero Image Skeleton */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200" />

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Back Button Skeleton */}
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Title & Info */}
            <Card className="p-6 space-y-4">
              {/* Title */}
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              
              {/* Travel Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </Card>

            {/* Itinerary */}
            <Card className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Facilities */}
            <Card className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded flex-1" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="p-6 space-y-4 sticky top-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>

              <div className="h-12 bg-gray-200 rounded-lg w-full" />
              <div className="h-10 bg-gray-200 rounded-lg w-full" />
            </Card>

            {/* Travel Info Card */}
            <Card className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
