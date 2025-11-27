import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getSiteSettings() {
  try {
    const [titleSetting, faviconSetting, metaDescSetting, ogImageSetting] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'siteTitle' } }),
      prisma.settings.findUnique({ where: { key: 'siteFavicon' } }),
      prisma.settings.findUnique({ where: { key: 'metaDescription' } }),
      prisma.settings.findUnique({ where: { key: 'ogImage' } })
    ])
    
    return {
      title: titleSetting?.value || 'Tripbaitullah - Temukan Paket Umroh Terbaik',
      favicon: faviconSetting?.value || '/favicon.ico',
      description: metaDescSetting?.value || 'Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya',
      ogImage: ogImageSetting?.value || '/og-image.png'
    }
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return {
      title: 'Tripbaitullah - Temukan Paket Umroh Terbaik',
      favicon: '/favicon.ico',
      description: 'Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya',
      ogImage: '/og-image.png'
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  
  // Ensure OG image is absolute URL
  const ogImageUrl = settings.ogImage.startsWith('http') 
    ? settings.ogImage 
    : `https://www.tripbaitullah.com${settings.ogImage}`
  
  return {
    title: {
      default: settings.title,
      template: `%s | ${settings.title}`
    },
    description: settings.description,
    keywords: ["umroh", "travel umroh", "paket umroh", "haji", "ibadah", "muslim", "travel"],
    authors: [{ name: "Tripbaitullah Team" }],
    openGraph: {
      title: settings.title,
      description: settings.description,
      url: 'https://www.tripbaitullah.com',
      siteName: 'Tripbaitullah',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Tripbaitullah - Smart Way to Go Baitullah',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.title,
      description: settings.description,
      images: [ogImageUrl],
    },
    icons: {
      icon: settings.favicon,
      shortcut: settings.favicon,
      apple: settings.favicon,
    },
    openGraph: {
      title: settings.title,
      description: "Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya",
      url: "https://tripbaitullah.com",
      siteName: settings.title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title,
      description: "Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
