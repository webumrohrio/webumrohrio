'use client'

import { useEffect } from 'react'

export function ArticleListSEO() {
  useEffect(() => {
    // Add structured data for article listing page
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Artikel Umroh & Tips Perjalanan Ibadah',
      description: 'Baca artikel informatif seputar umroh, tips perjalanan ibadah, dan panduan umroh dari para ahli',
      url: 'https://www.tripbaitullah.com/artikel',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.tripbaitullah.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Artikel',
            item: 'https://www.tripbaitullah.com/artikel'
          }
        ]
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Daftar Artikel Umroh',
        description: 'Koleksi artikel informatif seputar umroh dan perjalanan ibadah',
        itemListElement: []
      },
      about: {
        '@type': 'Thing',
        name: 'Umroh',
        description: 'Informasi dan panduan seputar ibadah umroh'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tripbaitullah',
        url: 'https://www.tripbaitullah.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.tripbaitullah.com/logo.png'
        }
      }
    }

    // Check if script already exists
    let script = document.querySelector('script[data-type="article-list-schema"]')
    
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      script.setAttribute('data-type', 'article-list-schema')
      document.head.appendChild(script)
    }
    
    script.textContent = JSON.stringify(structuredData)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[data-type="article-list-schema"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
