/* Minimal service worker — required for installability on Chromium browsers. */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Network-only; never leave an unhandled rejection (HMR / offline / aborted).
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response('', {
          status: 503,
          statusText: 'Service Unavailable',
        })
    )
  )
})
