/*
self.addEventListener('install', event => {
  console.log('Service Worker installed');
});
self.addEventListener('fetch', event => {});
*/
const CACHE_NAME = 'kirjappi-cache-v1';
const FILES_TO_CACHE = [
  'index.html',
  'images/unread.png',
  'images/active.png',
  'images/paused.png',
  'images/read.png',
  'images/next.png',
];

// Install: pre-cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => console.log('Service Worker installed and files cached'))
      .catch(err => console.error('Service Worker install failed:', err))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim(); // Take control of pages immediately
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Update cache with latest network response
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(event.request)) // offline fallback
  );
});

