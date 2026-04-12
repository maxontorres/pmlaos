// Advanced Service Worker for PWA
const VERSION = 'v2.1.0';
const CACHE_STATIC = `pmlaos-static-${VERSION}`;
const CACHE_DYNAMIC = `pmlaos-dynamic-${VERSION}`;
const CACHE_IMAGES = `pmlaos-images-${VERSION}`;
const CACHE_API = `pmlaos-api-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
];

const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper: Limit cache size
const limitCacheSize = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
};

// Helper: Clean old cache entries
const cleanOldCacheEntries = async (cacheName) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    const dateHeader = response?.headers.get('date');
    if (dateHeader) {
      const cacheTime = new Date(dateHeader).getTime();
      if (now - cacheTime > MAX_CACHE_AGE) {
        await cache.delete(request);
      }
    }
  }
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version', VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version', VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients about update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: VERSION
            });
          });
        });
      })
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip authentication routes - CRITICAL for OAuth to work in PWA
  if (url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_API);
            cache.put(request, response.clone());
            await limitCacheSize(CACHE_API, MAX_CACHE_SIZE);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return new Response(JSON.stringify({ 
            error: 'Offline', 
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        })
    );
    return;
  }

  // Images - Cache first, network fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request)
            .then(async (response) => {
              if (response.ok) {
                const cache = await caches.open(CACHE_IMAGES);
                cache.put(request, response.clone());
                await limitCacheSize(CACHE_IMAGES, MAX_CACHE_SIZE);
              }
              return response;
            })
            .catch(() => {
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // Static assets - Cache first
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => cached || fetch(request))
    );
    return;
  }

  // HTML pages - Network first, cache fallback, offline page as last resort
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, response.clone());
            await limitCacheSize(CACHE_DYNAMIC, MAX_CACHE_SIZE);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Other resources - Stale while revalidate
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        const fetchPromise = fetch(request)
          .then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE_DYNAMIC);
              cache.put(request, response.clone());
              await limitCacheSize(CACHE_DYNAMIC, MAX_CACHE_SIZE);
            }
            return response;
          });
        return cached || fetchPromise;
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-properties') {
    event.waitUntil(syncProperties());
  }
});

async function syncProperties() {
  try {
    const cache = await caches.open(CACHE_API);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/properties') && request.method === 'POST') {
        await fetch(request);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PM Laos', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'CLEAN_OLD_CACHE') {
    event.waitUntil(
      Promise.all([
        cleanOldCacheEntries(CACHE_DYNAMIC),
        cleanOldCacheEntries(CACHE_IMAGES),
        cleanOldCacheEntries(CACHE_API)
      ])
    );
  }
});

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-properties') {
    event.waitUntil(updatePropertiesCache());
  }
});

async function updatePropertiesCache() {
  try {
    const response = await fetch('/api/properties');
    const cache = await caches.open(CACHE_API);
    await cache.put('/api/properties', response);
  } catch (error) {
    console.error('[SW] Failed to update properties cache:', error);
  }
}
