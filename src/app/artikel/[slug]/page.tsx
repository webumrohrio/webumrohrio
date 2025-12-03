import { MobileLayout } from '@/components/mobile-layout'
import { ArticleInteractions } from '@/components/article-interactions'
import { ArticleComments } from '@/components/article-comments'
import { ArticleRelated } from '@/components/article-related'
import { ArticleViewTracker } from '@/components/article-view-tracker'
import { ReadProgress } from '@/components/read-progress'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, generateMetadata } from './metadata'

// Export metadata function
export { generateMetadata }

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// Convert line breaks to HTML
function formatContent(content: string) {
  return content
    .replace(/\r\n/g, '<br />')
    .replace(/\n/g, '<br />')
    .replace(/\r/g, '<br />')
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  // Generate structured data
  const imageUrl = article.image.startsWith('http') ? article.image : `https://www.tripbaitullah.com${article.image}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://www.tripbaitullah.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tripbaitullah',
      url: 'https://www.tripbaitullah.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.tripbaitullah.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.tripbaitullah.com/artikel/${article.slug}`
    },
    keywords: article.tags.split(',').map(tag => tag.trim()).join(', '),
    articleSection: 'Umroh',
    inLanguage: 'id-ID'
  }

  // Format date
  const formattedDate = new Date(article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <MobileLayout hideBottomNav>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* View Tracker */}
      <ArticleViewTracker articleId={article.id} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header with Progress Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Link href="/artikel">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-primary">Detail Artikel</h1>
          </div>
          {/* Read Progress Component */}
          <ReadProgress />
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={article.image}
              alt={`${article.title} - Artikel Umroh oleh ${article.travelName}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          {/* Article Info */}
          <Card className="p-4 md:p-6">
            {/* Article Interactions (Tags, Favorite, Share) */}
            <ArticleInteractions
              articleId={article.id}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              author={article.author}
              createdAt={formattedDate}
              tags={article.tags}
              views={article.views}
            />

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{article.travelName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>5 menit baca</span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
          </Card>

          {/* Comments Section */}
          <ArticleComments articleId={article.id} />

          {/* Related Articles */}
          <ArticleRelated currentArticleId={article.id} tags={article.tags} />
        </div>
      </div>
    </MobileLayout>
  )
}
