import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@neondatabase/serverless'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react-map-gl', 'maplibre-gl'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cloud.umami.is",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: https://tile.openstreetmap.org",
              "font-src 'self' data:",
              "connect-src 'self' https://tile.openstreetmap.org https://*.neon.tech https://cloud.umami.is",
              "frame-src 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
