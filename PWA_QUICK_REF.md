# 🚀 PWA Quick Reference Card

## Essential Commands

```bash
# Build and test PWA
npm run build
npm start

# Check PWA in DevTools
# Application > Manifest
# Application > Service Workers
# Application > Cache Storage
```

## Import PWA Utils

```typescript
import {
  isPWA,                          // Check if running as installed PWA
  canInstall,                     // Check if can be installed
  isOnline,                       // Check network status
  getDeviceInfo,                  // Get device information
  subscribeToPushNotifications,   // Subscribe to push
  showNotification,               // Show notification
  registerBackgroundSync,         // Register background sync
  shareContent,                   // Use Web Share API
  getCacheStats,                  // Get cache statistics
  clearAllCaches,                 // Clear all caches
  updateServiceWorker,            // Update service worker
} from '@/lib/pwa-utils'
```

## Common Patterns

### Check if PWA
```typescript
if (isPWA()) {
  // Running as installed app
}
```

### Get Device Info
```typescript
const { isMobile, isIOS, isAndroid, isStandalone } = getDeviceInfo()
```

### Show Notification
```typescript
await showNotification('Title', {
  body: 'Message body',
  icon: '/icon-192x192.png'
})
```

### Share Content
```typescript
await shareContent({
  title: 'Property Title',
  text: 'Check out this property',
  url: window.location.href
})
```

### Monitor Connectivity
```typescript
import { addConnectivityListeners } from '@/lib/pwa-utils'

const cleanup = addConnectivityListeners(
  () => console.log('Online'),
  () => console.log('Offline')
)

// Later: cleanup()
```

### Background Sync
```typescript
await registerBackgroundSync('sync-properties')
```

### Push Notifications
```typescript
const subscription = await subscribeToPushNotifications()
// Send subscription to server
```

## Cache Strategies (in sw.js)

```javascript
// Static assets - Cache first
CACHE_STATIC

// Images - Cache first
CACHE_IMAGES

// API calls - Network first, cache fallback
CACHE_API

// HTML pages - Network first, cache fallback
CACHE_DYNAMIC

// Others - Stale while revalidate
CACHE_DYNAMIC
```

## Update Service Worker

```typescript
// Update VERSION in public/sw.js
const VERSION = 'v2.1.0'  // Increment this

// Users will see update banner automatically
```

## Manifest Configuration

```json
// public/manifest.json
{
  "name": "App Name",           // Full name
  "short_name": "App",          // Home screen (12 chars max)
  "theme_color": "#000000",     // Browser UI color
  "background_color": "#fff",   // Splash screen
  "display": "standalone"       // App mode
}
```

## Shortcuts

```json
// Add to manifest.json
{
  "shortcuts": [
    {
      "name": "Action Name",
      "url": "/route",
      "icons": [{"src": "/icon-192x192.png", "sizes": "192x192"}]
    }
  ]
}
```

## Testing Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] Works offline
- [ ] Update banner shows on new version
- [ ] Caches populate correctly
- [ ] Manifest loads without errors

## Debug Tools

```typescript
// Get cache stats
const { caches, totalSize } = await getCacheStats()
console.log(`${caches.length} caches, ${totalSize / 1024 / 1024} MB`)

// Clear all caches
await clearAllCaches()

// Force update
await updateServiceWorker()

// Unregister (debugging only)
await unregisterServiceWorker()
```

## Browser DevTools

**Manifest:** Application > Manifest
**Service Worker:** Application > Service Workers
**Cache:** Application > Cache Storage
**Test Offline:** Network tab > Offline checkbox
**Lighthouse:** Lighthouse tab > Generate report

## Common Issues

### SW not registering
- Build with `npm run build`
- Use `npm start` not `npm run dev`
- Check HTTPS (or localhost)

### Install prompt not showing
- Visit site multiple times
- Check manifest errors in DevTools
- Try different browser

### Offline not working
- Check SW is active
- Visit pages online first
- Check cache storage

### Changes not appearing
- Update VERSION in sw.js
- Hard reload (Ctrl+Shift+R)
- Clear caches

## File Locations

```
public/
  manifest.json       # App manifest
  sw.js              # Service worker
  offline.html       # Offline page
  icon-*.png         # App icons

components/
  PWAInstaller.tsx   # PWA UI component

lib/
  pwa-utils.ts       # Utility functions

app/
  layout.tsx         # PWA metadata
```

## Environment Variables

```bash
# .env.local (optional, for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## Quick Stats

- **Service Worker:** v2.0.0
- **Caches:** 4 types (Static, Dynamic, Images, API)
- **Cache limit:** 50 items per type
- **Cache TTL:** 7 days for dynamic content
- **Update check:** Every hour
- **Offline page:** Yes
- **Push support:** Yes (with setup)
- **Background sync:** Yes
- **Share target:** Yes

## Resources

- `PWA_ADVANCED.md` - Complete guide
- `PWA_OPTIMIZATION_SUMMARY.md` - What was done
- DevTools Application tab - Testing
- [web.dev/pwa](https://web.dev/progressive-web-apps/) - Learn more

---

**Quick tip:** Test PWA features in production build only (`npm run build && npm start`)
