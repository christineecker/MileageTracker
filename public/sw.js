const CACHE_NAME = 'mileagetracker-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg'
];

// Install Event - cache core static shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network-first falling back to cache strategy
self.addEventListener('fetch', (event) => {
  // Only handle standard GET requests (ignore API requests or external CDN scripts if desired)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for subsequent offline loads
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network request fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If completely offline and page can't be fetched, serve root SPA shell
          if (event.request.mode === 'navigate') {
            return caches.match('./') || caches.match('index.html');
          }
        });
      })
  );
});
