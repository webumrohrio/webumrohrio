'use client'

import { Button } from '@/components/ui/button'
import { PackageX, Search, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'package' | 'search'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon = 'package', 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : PackageX

  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4">
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border-2 border-primary/20 animate-in zoom-in duration-500">
          <Icon className="w-10 h-10 md:w-12 md:h-12 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-md space-y-2 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {description}
        </p>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
