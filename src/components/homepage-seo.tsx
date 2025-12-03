'use client'

import { useEffect } from 'react'

export function HomepageSEO() {
  useEffect(() => {
    // Add structured data for homepage
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Tripbaitullah',
      description: 'Platform Paket Umroh Terpercaya',
      url: 'https://www.tripbaitullah.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.tripbaitullah.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tripbaitullah',
        url: 'https://www.tripbaitullah.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.tripbaitullah.com/logo.png'
        },
        sameAs: [
          // Add social media links here if available
        ]
      }
    }

    // Check if script already exists
    let script = document.querySelector('script[type="application/ld+json"]')
    
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    
    script.textContent = JSON.stringify(structuredData)

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null // This component doesn't render anything
}
