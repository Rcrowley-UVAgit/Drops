const CACHE_NAME = 'revinyl-v1'

// Assets to pre-cache on install
const BASE = '/Drops'
const PRECACHE = [BASE + '/', BASE + '/index.html']

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// Activate: clean old caches, take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for navigation, cache-first for static assets, skip API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and cross-origin API calls
  if (event.request.method !== 'GET') return
  if (url.hostname.includes('supabase')) return
  if (url.hostname.includes('spotify')) return
  if (url.hostname.includes('googleapis.com')) return

  // Navigation requests: network-first, fallback to cached /index.html (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(BASE + '/index.html'))
    )
    return
  }

  // Static assets: cache-first
  if (url.pathname.includes('/assets/') || url.pathname.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
      })
    )
    return
  }
})

// Push notification received
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'ReVinyl'
  const options = {
    body: data.body || '',
    icon: '/Drops/icons/icon-192.png',
    badge: '/Drops/icons/icon-192.png',
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click: open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url)
    })
  )
})
