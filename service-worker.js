// service-worker.js
// ============================================
// Advanced Service Worker for LegalNewsIndia
// - Static and dynamic caching
// - Smart cache strategies
// - Upgrades and cleanup
// ============================================

const CACHE_NAME = 'lni-v2-static';      // Change to force update
const DATA_CACHE = 'lni-v2-dynamic';    // For dynamic content caching (e.g. articles)
const STATIC_ASSETS = [
  '/', '/index.html', '/style.css', '/app.js'
  // Add more static assets if needed (e.g., '/manifest.json')
];

// On install: cache core files only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(self.skipWaiting())
  );
});

// On activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DATA_CACHE)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: distinguish HTML navigation requests
function isHtmlRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept') &&
     request.headers.get('accept').includes('text/html'));
}

// Main fetch handler!
self.addEventListener('fetch', event => {
  const { request } = event;

  // 1. Network-first for HTML/navigation
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache the response
          const respClone = response.clone();
          caches.open(DATA_CACHE).then(cache => cache.put(request, respClone));
          return response;
        })
        .catch(() => 
          // fallback to cache if offline
          caches.match(request).then(resp => 
            resp || caches.match('/index.html')
          )
        )
    );
    return;
  }

  // 2. Cache-first for static assets (css/js/png/etc)
  if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request)
          .then(response => {
            // Update cache if fetched
            const respClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
            return response;
          }))
    );
    return;
  }

  // 3. Default: try network, then dynamic cache fallback (for e.g. images, API calls)
  event.respondWith(
    fetch(request).then(response => {
      // Cache dynamically
      const respClone = response.clone();
      caches.open(DATA_CACHE).then(cache => cache.put(request, respClone));
      return response;
    }).catch(() => caches.match(request))
  );
});

// Optional: Listen for skipWaiting or custom messages for upgrades/background sync
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Place for future background sync or push notification logic
});
