'use client'

import { useEffect } from 'react'

export function TravelListSEO() {
  useEffect(() => {
    // Add structured data for travel listing page
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Daftar Travel Umroh Terpercaya',
      description: 'Temukan travel umroh terpercaya di Indonesia. Bandingkan layanan, harga, dan reputasi dari berbagai travel penyelenggara umroh.',
      url: 'https://www.tripbaitullah.com/travel-umroh',
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
            name: 'Travel Umroh',
            item: 'https://www.tripbaitullah.com/travel-umroh'
          }
        ]
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Daftar Travel Umroh',
        description: 'Koleksi travel umroh terpercaya di Indonesia',
        itemListElement: []
      },
      about: {
        '@type': 'Service',
        serviceType: 'Travel Umroh',
        provider: {
          '@type': 'Organization',
          name: 'Tripbaitullah'
        },
        areaServed: {
          '@type': 'Country',
          name: 'Indonesia'
        }
      }
    }

    // Check if script already exists
    let script = document.querySelector('script[data-type="travel-list-schema"]')
    
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      script.setAttribute('data-type', 'travel-list-schema')
      document.head.appendChild(script)
    }
    
    script.textContent = JSON.stringify(structuredData)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[data-type="travel-list-schema"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
