import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts', './proxy.ts')

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
