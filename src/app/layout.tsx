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
    const [titleSetting, faviconSetting] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'siteTitle' } }),
      prisma.settings.findUnique({ where: { key: 'siteFavicon' } })
    ])
    
    return {
      title: titleSetting?.value || 'Tripbaitullah - Temukan Paket Umroh Terbaik',
      favicon: faviconSetting?.value || '/favicon.ico'
    }
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return {
      title: 'Tripbaitullah - Temukan Paket Umroh Terbaik',
      favicon: '/favicon.ico'
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  
  return {
    title: {
      default: settings.title,
      template: `%s | ${settings.title}`
    },
    description: "Aplikasi web untuk menemukan paket umroh dari berbagai travel penyelenggara terpercaya. Nikmati kemudahan memilih paket umroh sesuai kebutuhan Anda.",
    keywords: ["umroh", "travel umroh", "paket umroh", "haji", "ibadah", "muslim", "travel"],
    authors: [{ name: "Tripbaitullah Team" }],
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
