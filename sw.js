/* BetterSolano Service Worker */

var CACHE_NAME = 'bettersolano-v1';
var OFFLINE_URL = '/offline.html';

var PRECACHE_URLS = [
  '/',
  '/contact/',
  '/services/',
  '/government/',
  '/assets/css/style.css',
  '/assets/css/responsive.css',
  '/assets/css/accessibility.css',
  '/assets/css/footer.css',
  '/assets/js/main.js',
  '/assets/js/translations.js',
  '/assets/images/logo/better-solano-logo.svg',
  '/assets/images/logo/better-solano-logo-white.svg',
  '/assets/images/logo/favicon.svg',
  '/data/services.json',
  '/data/officials.json',
  '/manifest.webmanifest',
  OFFLINE_URL
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function() {
          return caches.match(event.request).then(function(cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request);
      })
    );
  }
});
