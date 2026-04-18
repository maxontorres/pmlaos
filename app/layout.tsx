import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import PWAInstaller from '@/components/PWAInstaller'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'PM Real Estate - Property Management in Laos',
    template: '%s | PM Real Estate'
  },
  description: 'Browse, search and manage properties in Vientiane, Laos. Fast, reliable and works offline.',
  keywords: ['real estate', 'property', 'Laos', 'Vientiane', 'property management', 'rentals', 'sales'],
  authors: [{ name: 'PM Laos' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PM Laos',
    startupImage: [
      {
        url: '/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  openGraph: {
    title: 'PM Real Estate - Property Management in Laos',
    description: 'Browse, search and manage properties in Vientiane, Laos',
    images: ['/og-image.jpg'],
    type: 'website',
    siteName: 'PM Real Estate',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PM Real Estate - Property Management in Laos',
    description: 'Browse, search and manage properties in Vientiane, Laos',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL('https://pmlaos.com'),
  alternates: {
    canonical: 'https://pmlaos.com',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PM Laos" />
        <meta name="apple-mobile-web-app-title" content="PM Laos" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <PWAInstaller />
        {children}
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="46824b11-7ff6-4be8-9c6b-b0d30d0e2ec0" />
      </body>
    </html>
  )
}
