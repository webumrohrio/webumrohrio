'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ArticleCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  image: string
  date: string
  readTime: string
  category: string
}

const ArticleCardComponent = ({ id, slug, title, excerpt, image, date, readTime, category }: ArticleCardProps) => {
  const router = useRouter()
  const [imgSrc, setImgSrc] = useState(image)
  
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    router.push(`/artikel/${slug}`)
  }
  
  return (
    <Card 
      className="group cursor-pointer bg-card border border-border hover:border-primary/50 hover:shadow-xl active:scale-[0.98] transition-all duration-300 overflow-hidden rounded-2xl p-0"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
          onError={() => setImgSrc('https://placehold.co/600x400/e2e8f0/64748b?text=Artikel')}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-gradient-to-r from-primary to-primary/90 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-sm border border-primary/20 animate-in slide-in-from-left duration-300">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200 mb-2 min-h-[2.5rem] md:min-h-[3rem]">
          {title}
        </h3>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-primary/70" />
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary/70" />
            <span className="font-medium">{readTime}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}


// Memoize component to prevent unnecessary re-renders
export const ArticleCard = memo(ArticleCardComponent)
ArticleCard.displayName = 'ArticleCard'
