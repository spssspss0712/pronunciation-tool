const CACHE_NAME = 'pronunciation-tool-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/chinese-dictionary.js',
  '/close-mouth.png',
  '/half-open-mouth.png',
  '/open-mouth.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/index.html');
    })
  );
});
