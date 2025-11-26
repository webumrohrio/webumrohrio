'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface FilterChip {
  id: string
  label: string
  value: string
  type: 'sort' | 'month' | 'duration' | 'price' | 'location' | 'category'
}

interface FilterChipsProps {
  filters: FilterChip[]
  onRemove: (filterId: string) => void
  onClearAll: () => void
}

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null

  const getChipColor = (type: FilterChip['type']) => {
    switch (type) {
      case 'sort':
        return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800'
      case 'month':
        return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800'
      case 'duration':
        return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800'
      case 'price':
        return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-800'
      case 'location':
        return 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-800'
      case 'category':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-800'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="text-xs font-medium text-muted-foreground">Filter Aktif:</span>
      
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className={`${getChipColor(filter.type)} pl-2.5 pr-1.5 py-1 gap-1.5 border transition-all duration-200 hover:scale-105 active:scale-95 animate-in zoom-in duration-200`}
        >
          <span className="text-xs font-semibold">{filter.label}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
            aria-label={`Hapus filter ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="w-3 h-3 mr-1" />
          Hapus Semua
        </Button>
      )}
    </div>
  )
}
