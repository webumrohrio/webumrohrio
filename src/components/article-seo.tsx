'use client'

import { useEffect } from 'react'

interface ArticleSEOProps {
  article: {
    title: string
    excerpt: string
    content: string
    image: string
    slug: string
    createdAt: string
    author: string
    travelName: string
    tags: string
  }
}

export function ArticleSEO({ article }: ArticleSEOProps) {
  useEffect(() => {
    // Update document title
    document.title = `${article.title} | Tripbaitullah`

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', article.excerpt || article.title)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = article.excerpt || article.title
      document.head.appendChild(meta)
    }

    // Update OG tags
    const articleUrl = `https://www.tripbaitullah.com/artikel/${article.slug}`
    const imageUrl = article.image.startsWith('http') 
      ? article.image 
      : `https://www.tripbaitullah.com${article.image}`

    const ogTags = [
      { property: 'og:title', content: article.title },
      { property: 'og:description', content: article.excerpt || article.title },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: articleUrl },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: 'Tripbaitullah' },
      { property: 'article:author', content: article.author },
      { property: 'article:published_time', content: article.createdAt },
      { property: 'article:tag', content: article.tags },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.title },
      { name: 'twitter:description', content: article.excerpt || article.title },
      { name: 'twitter:image', content: imageUrl },
    ]

    ogTags.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      
      if (meta) {
        meta.setAttribute('content', content)
      } else {
        meta = document.createElement('meta')
        if (property) meta.setAttribute('property', property)
        if (name) meta.setAttribute('name', name)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
      }
    })

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonical) {
      canonical.href = articleUrl
    } else {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      canonical.href = articleUrl
      document.head.appendChild(canonical)
    }

    // Add structured data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: imageUrl,
      datePublished: article.createdAt,
      dateModified: article.createdAt,
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

    // Remove existing structured data if any
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Optional: cleanup if needed
    }
  }, [article])

  return null // This component doesn't render anything
}
