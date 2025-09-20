// Service worker for offline support (PWA)
// Caches core files for offline access

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('lni-cache-v1').then((cache) => {
      return cache.addAll([
        '/', 
        '/index.html', 
        '/style.css', 
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => 
      response || fetch(event.request)
    )
  );
});
