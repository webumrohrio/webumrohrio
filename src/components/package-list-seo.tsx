'use client'

import { useEffect } from 'react'

export function PackageListSEO() {
  useEffect(() => {
    // Add structured data for package listing page
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Paket Umroh Terlengkap',
      description: 'Temukan dan bandingkan paket umroh dari berbagai travel terpercaya',
      url: 'https://www.tripbaitullah.com/paket-umroh',
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
            name: 'Paket Umroh',
            item: 'https://www.tripbaitullah.com/paket-umroh'
          }
        ]
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Daftar Paket Umroh',
        description: 'Koleksi paket umroh dari berbagai travel penyelenggara'
      }
    }

    // Check if script already exists
    let script = document.querySelector('script[data-type="package-list-schema"]')
    
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      script.setAttribute('data-type', 'package-list-schema')
      document.head.appendChild(script)
    }
    
    script.textContent = JSON.stringify(structuredData)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[data-type="package-list-schema"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
