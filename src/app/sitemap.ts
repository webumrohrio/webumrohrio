import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.tripbaitullah.com'

  try {
    // Fetch all active travels
    const travels = await prisma.travel.findMany({
      where: { isActive: true },
      select: { username: true, updatedAt: true }
    })

    // Fetch all active packages
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      select: { 
        slug: true, 
        updatedAt: true,
        travel: {
          select: { username: true }
        }
      }
    })

    // Fetch all published articles
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true }
    })

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/travel-umroh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/paket-umroh`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/artikel`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/bantuan`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Travel pages
    const travelPages: MetadataRoute.Sitemap = travels.map((travel) => ({
      url: `${baseUrl}/${travel.username}`,
      lastModified: travel.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Package pages
    const packagePages: MetadataRoute.Sitemap = packages.map((pkg) => ({
      url: `${baseUrl}/${pkg.travel.username}/paket/${pkg.slug}`,
      lastModified: pkg.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Article pages
    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/artikel/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...travelPages, ...packagePages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  } finally {
    await prisma.$disconnect()
  }
}
