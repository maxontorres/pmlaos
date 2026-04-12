# Vercel Deployment Guide

## Prerequisites

1. **Database**: Ensure your Neon database is accessible from Vercel
2. **Cloudinary Account**: For image hosting
3. **Domain** (optional): Configure custom domain

## Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://pmlaos.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important Notes:**
- `NEXTAUTH_URL` should be your production domain (https://pmlaos.com)
- For preview deployments, NextAuth will automatically use the preview URL
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- Update Google OAuth authorized redirect URIs to include: `https://pmlaos.com/api/auth/callback/google`

## Deployment Steps

### 1. Connect Repository
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Login and link project
vercel login
vercel link
```

### 2. Configure Build Settings

Vercel will auto-detect Next.js. Manual configuration (if needed):
- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Performance Optimizations

✅ **Implemented**:
- Image optimization with AVIF/WebP formats
- Compression enabled
- SWC minification
- Package import optimization (react-map-gl, maplibre-gl)
- Prisma binary targets for Vercel
- Edge-ready Neon database adapter
- Regional deployment (Singapore)
- ETags for caching
- Removed powered-by header

## Database Setup

The app uses Prisma with Neon PostgreSQL. Ensure:
1. Connection pooling is enabled in Neon
2. DATABASE_URL includes `?sslmode=require`
3. Prisma client is generated during build

## PWA Support

PWA features work on Vercel automatically. The service worker will be served at `/sw.js`.

## Monitoring

Analytics configured:
- Umami analytics included in root layout
- Vercel Analytics (add via Vercel dashboard)

## Regional Deployment

Configured for Singapore region (`sin1`) in `vercel.json`. Change if needed:
- `sin1` - Singapore
- `hnd1` - Tokyo
- `iad1` - Washington DC
- `sfo1` - San Francisco

## Troubleshooting

### Build Failures
- Check Prisma generation logs
- Verify DATABASE_URL is set
- Ensure all dependencies are in `package.json`

### Runtime Errors
- Check Vercel function logs
- Verify environment variables
- Check database connection pooling

### Image Loading Issues
- Verify Cloudinary credentials
- Check image domains in `next.config.ts`

## Cost Optimization

- Use Vercel's Image Optimization
- Enable edge caching where possible
- Monitor function execution time (currently set to 10s max)
- Use Neon's free tier or scale tier as needed
