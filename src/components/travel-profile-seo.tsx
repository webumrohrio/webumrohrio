'use client'

import { useEffect } from 'react'

interface TravelProfileSEOProps {
  travel: {
    name: string
    username: string
    description: string
    logo: string
    address: string
    city: string
    phone: string
    email: string
    website: string
    instagram: string
    rating: number
    isVerified: boolean
  }
}

export function TravelProfileSEO({ travel }: TravelProfileSEOProps) {
  useEffect(() => {
    // Add structured data for travel profile
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: travel.name,
      description: travel.description,
      url: `https://www.tripbaitullah.com/${travel.username}`,
      logo: travel.logo.startsWith('http') ? travel.logo : `https://www.tripbaitullah.com${travel.logo}`,
      image: travel.logo.startsWith('http') ? travel.logo : `https://www.tripbaitullah.com${travel.logo}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: travel.address,
        addressLocality: travel.city,
        addressCountry: 'ID'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: travel.phone,
        email: travel.email,
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'Arabic']
      },
      aggregateRating: travel.rating > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: travel.rating,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      sameAs: [
        travel.website,
        travel.instagram ? (travel.instagram.startsWith('http') ? travel.instagram : `https://instagram.com/${travel.instagram.replace('@', '')}`) : null
      ].filter(Boolean)
    }

    // Add breadcrumb
    const breadcrumbData = {
      '@context': 'https://schema.org',
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
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: travel.name,
          item: `https://www.tripbaitullah.com/${travel.username}`
        }
      ]
    }

    // Add organization schema
    let orgScript = document.querySelector('script[data-type="travel-org-schema"]')
    if (!orgScript) {
      orgScript = document.createElement('script')
      orgScript.setAttribute('type', 'application/ld+json')
      orgScript.setAttribute('data-type', 'travel-org-schema')
      document.head.appendChild(orgScript)
    }
    orgScript.textContent = JSON.stringify(structuredData)

    // Add breadcrumb schema
    let breadcrumbScript = document.querySelector('script[data-type="travel-breadcrumb-schema"]')
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script')
      breadcrumbScript.setAttribute('type', 'application/ld+json')
      breadcrumbScript.setAttribute('data-type', 'travel-breadcrumb-schema')
      document.head.appendChild(breadcrumbScript)
    }
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData)

    return () => {
      // Cleanup
      const existingOrgScript = document.querySelector('script[data-type="travel-org-schema"]')
      if (existingOrgScript) {
        existingOrgScript.remove()
      }
      const existingBreadcrumbScript = document.querySelector('script[data-type="travel-breadcrumb-schema"]')
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove()
      }
    }
  }, [travel])

  return null
}
