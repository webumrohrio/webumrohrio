import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        travel: true,
        admin: true
      }
    })

    if (!article) {
      return {
        title: 'Artikel Tidak Ditemukan | Tripbaitullah',
        description: 'Artikel yang Anda cari tidak ditemukan'
      }
    }

    const authorName = article.admin?.name || article.travel?.name || 'Tripbaitullah'
    const articleUrl = `https://www.tripbaitullah.com/artikel/${article.slug}`
    
    // Ensure image is absolute URL
    const imageUrl = article.image 
      ? (article.image.startsWith('http') ? article.image : `https://www.tripbaitullah.com${article.image}`)
      : 'https://www.tripbaitullah.com/logo.png'

    return {
      title: `${article.title} | Tripbaitullah`,
      description: article.excerpt || article.title,
      keywords: article.tags ? article.tags.split(',').map(tag => tag.trim()) : [],
      authors: [{ name: authorName }],
      openGraph: {
        title: article.title,
        description: article.excerpt || article.title,
        url: articleUrl,
        siteName: 'Tripbaitullah',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        locale: 'id_ID',
        type: 'article',
        publishedTime: article.createdAt.toISOString(),
        modifiedTime: article.updatedAt.toISOString(),
        authors: [authorName],
        tags: article.tags ? article.tags.split(',').map(tag => tag.trim()) : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || article.title,
        images: [imageUrl],
      },
      alternates: {
        canonical: articleUrl,
      },
    }
  } catch (error) {
    console.error('Error generating article metadata:', error)
    return {
      title: 'Artikel | Tripbaitullah',
      description: 'Baca artikel menarik seputar umroh dan perjalanan ibadah'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get article data for server component
export async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        travel: true,
        admin: true
      }
    })

    if (!article) {
      return null
    }

    const authorName = article.admin?.name || article.travel?.name || 'Tripbaitullah'
    const travelName = article.travel?.name || 'Tripbaitullah'

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content || '',
      excerpt: article.excerpt || '',
      image: article.image || '/logo.png',
      tags: article.tags || '',
      views: article.views,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      author: authorName,
      travelName: travelName
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export function generateArticleStructuredData(article: {
  title: string
  excerpt: string
  content: string
  image: string
  slug: string
  createdAt: Date
  updatedAt: Date
  author: string
  tags: string
}) {
  const articleUrl = `https://www.tripbaitullah.com/artikel/${article.slug}`
  const imageUrl = article.image.startsWith('http') 
    ? article.image 
    : `https://www.tripbaitullah.com${article.image}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
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
      '@id': articleUrl
    },
    keywords: article.tags.split(',').map(tag => tag.trim()).join(', '),
    articleSection: 'Umroh',
    inLanguage: 'id-ID'
  }
}
