'use client'

import { MobileLayout } from '@/components/mobile-layout'
import { ArticleListSEO } from '@/components/article-list-seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Eye, User, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  excerpt: string
  image: string
  slug: string
  tags: string
  views: number
  createdAt: string
  travelName: string
}

export default function Artikel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const result = await response.json()
      
      if (result.success) {
        const formattedArticles = result.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || '',
          image: article.image,
          slug: article.slug,
          tags: article.tags || '',
          views: article.views,
          createdAt: new Date(article.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          travelName: article.admin ? article.admin.name : (article.travel ? article.travel.name : 'Admin')
        }))
        setArticles(formattedArticles)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || article.tags.toLowerCase().includes(categoryFilter.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  // Extract unique categories from articles
  const categories = Array.from(new Set(articles.map(article => {
    const tags = article.tags.split(',').map(tag => tag.trim())
    return tags[0] || ''
  }).filter(Boolean)))

  return (
    <MobileLayout>
      <ArticleListSEO />
      <div className="min-h-screen bg-background">
        {/* Header - Will scroll away */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-lg md:text-xl font-bold text-primary">Artikel</h1>
            <p className="text-sm text-muted-foreground">Tips dan informasi seputar umroh</p>
          </div>
        </header>

        {/* Search & Filter - Sticky, stays on top when scrolling */}
        <section className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-md">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <div className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari artikel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('')
                      toast.info('Pencarian dihapus')
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Results */}
        <main className="container mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {loading ? 'Memuat...' : `${filteredArticles.length} artikel ditemukan`}
            </p>
          </div>

          {/* Article List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/artikel/${article.slug}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-2 line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h3>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {article.excerpt}
                          </p>

                          {/* Tags */}
                          {article.tags && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {article.tags.split(',').map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{article.travelName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{article.createdAt}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>5 menit baca</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada artikel yang ditemukan</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearch('')}>
                Reset Pencarian
              </Button>
            </div>
          )}
        </main>
      </div>
    </MobileLayout>
  )
}