// NRGASM service worker: lets the installed app open without a network.
// Registered only in production builds (see src/main.tsx).
//
// - Pages: network first, so a new build shows up at once; the cached
//   app shell is the fallback when offline.
// - Built files (/assets/*): their names change with every build, so a
//   cached copy is always right. Cache first.
// - Everything else (can images, icons, Google Fonts): show the cached
//   copy at once and refresh it in the background.

const CACHE = 'nrgasm-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/icon-192.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Every route renders the same index.html, so one copy serves them all
      cache.put('/', response.clone());
    }
    return response;
  } catch {
    return (await cache.match('/')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached ?? Response.error());
  return cached ?? fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate' && sameOrigin) {
    event.respondWith(networkFirst(request));
  } else if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else if (sameOrigin || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
