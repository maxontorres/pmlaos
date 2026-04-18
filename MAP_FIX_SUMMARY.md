# Map Loading Issue Fix

## Problem
Maps are not loading on production (https://www.pmlaos.com) but work fine locally.

## Root Cause
The issue is likely caused by missing Content Security Policy (CSP) headers that block:
1. OpenStreetMap tile requests from `https://tile.openstreetmap.org`
2. MapLibre GL resources (workers, blobs)

## Solution Applied

### 1. Added CSP Headers in `next.config.ts`
Added proper CSP headers to allow:
- OpenStreetMap tiles in `img-src` and `connect-src`
- MapLibre GL workers via `worker-src 'self' blob:`
- Necessary inline styles and scripts for the map library

```typescript
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
}
```

## Deployment Steps

1. **Commit and push the changes:**
   ```bash
   git add next.config.ts
   git commit -m "Fix: Add CSP headers for OpenStreetMap tiles"
   git push
   ```

2. **Vercel will automatically deploy** the changes

3. **Test the map** on production after deployment:
   - Visit: https://www.pmlaos.com/en/listings/2-bedroom-apartment-luxury-in-vientiane-hvrll
   - The map should now load correctly

## Verification

After deployment, check:
- [ ] Map tiles load on listing detail pages
- [ ] Map controls (zoom in/out) work
- [ ] No CSP errors in browser console
- [ ] Map marker displays correctly

## Alternative Solutions (if issue persists)

### Option 1: Check Vercel Headers Override
Vercel might have its own CSP configuration. Check the Vercel dashboard:
- Project Settings → Headers
- Ensure no conflicting CSP headers

### Option 2: Use Different Tile Provider
If OSM tiles are blocked, switch to a different provider:
```typescript
const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© CARTO, © OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
    },
  ],
}
```

### Option 3: Add Error Boundary
Add error handling to LocationMap component to show fallback when map fails to load.

## Technical Details

- **MapLibre GL version:** ^5.22.0
- **React Map GL version:** ^8.1.0
- **Tile provider:** OpenStreetMap
- **CSP requirement:** Web workers need `blob:` protocol support
