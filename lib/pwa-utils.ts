// PWA Utilities and Helper Functions

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if browser supports PWA features
 */
export function supportsPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }
  
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }
  
  return Notification.permission
}

/**
 * Show a notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  const permission = await requestNotificationPermission()
  
  if (permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const notificationOptions: NotificationOptions = {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      }
      await registration.showNotification(title, notificationOptions)
    } else {
      new Notification(title, {
        icon: '/icon-192x192.png',
        ...options,
      })
    }
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      )
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
    }
    
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    
    return false
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

/**
 * Helper function to convert base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Add online/offline event listeners
 */
export function addConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Register for background sync
 */
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background sync not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await (registration as any).sync.register(tag)
    console.log(`Background sync registered: ${tag}`)
  } catch (error) {
    console.error('Background sync registration failed:', error)
  }
}

/**
 * Register for periodic background sync (experimental)
 */
export async function registerPeriodicSync(
  tag: string,
  minInterval: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<void> {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Periodic background sync not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName,
    })

    if (status.state === 'granted') {
      await (registration as any).periodicSync.register(tag, {
        minInterval,
      })
      console.log(`Periodic sync registered: ${tag}`)
    }
  } catch (error) {
    console.error('Periodic sync registration failed:', error)
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    return
  }

  try {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
    console.log('All caches cleared')
  } catch (error) {
    console.error('Failed to clear caches:', error)
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      console.log('Service worker updated')
    }
  } catch (error) {
    console.error('Service worker update failed:', error)
  }
}

/**
 * Unregister service worker (for debugging)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const success = await registration.unregister()
      console.log('Service worker unregistered:', success)
      return success
    }
    return false
  } catch (error) {
    console.error('Service worker unregister failed:', error)
    return false
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  caches: string[]
  totalSize: number
}> {
  if (!('caches' in window)) {
    return { caches: [], totalSize: 0 }
  }

  try {
    const cacheNames = await caches.keys()
    let totalSize = 0

    for (const name of cacheNames) {
      const cache = await caches.open(name)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          totalSize += blob.size
        }
      }
    }

    return {
      caches: cacheNames,
      totalSize,
    }
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return { caches: [], totalSize: 0 }
  }
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    console.warn('Web Share API not supported')
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error)
    }
    return false
  }
}

/**
 * Check if app can be installed
 */
export function canInstall(): boolean {
  if (typeof window === 'undefined') return false
  
  // If already installed, cannot install again
  if (isPWA()) {
    return false
  }
  
  // Check if browser supports installation
  return supportsPWA()
}

/**
 * Get device info
 */
export function getDeviceInfo(): {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isStandalone: false,
    }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent)
  const isStandalone = isPWA()

  return {
    isMobile,
    isIOS,
    isAndroid,
    isStandalone,
  }
}
