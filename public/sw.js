/**
 * NexSocket Service Worker — Phase 8 PWA
 *
 * Strategy:
 *  - App shell (HTML, CSS, JS) → Cache-First (always serve from cache after first install)
 *  - Google Fonts → Stale-While-Revalidate (serve cached, refresh in background)
 *  - Navigation requests → Cache-First with network fallback → offline shell
 *
 * Cache names are versioned so a new deploy busts old cache automatically.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `nexsocket-shell-${CACHE_VERSION}`;
const FONTS_CACHE = `nexsocket-fonts-${CACHE_VERSION}`;

// App shell assets — updated at build time by the Vite PWA plugin integration
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately on first install
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache failed for some assets:', err);
      });
    })
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== FONTS_CACHE)
          .map((key) => {
            console.log('[SW] Purging stale cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts → Stale-While-Revalidate
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(FONTS_CACHE, request));
    return;
  }

  // App shell and navigation → Cache-First
  if (
    url.origin === self.location.origin ||
    request.mode === 'navigate'
  ) {
    event.respondWith(cacheFirstWithOfflineFallback(request));
    return;
  }
});

// ─── Strategies ───────────────────────────────────────────────────────────────

/**
 * Cache-First: Return cached response if available. If not, fetch from
 * network, store a copy in cache, and return it. On total failure, return
 * the cached offline shell (index.html).
 */
async function cacheFirstWithOfflineFallback(request) {
  const cache = await caches.open(SHELL_CACHE);

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_err) {
    // Offline: serve the app shell for navigation requests
    if (request.mode === 'navigate') {
      const offlineShell = await cache.match('/index.html');
      if (offlineShell) return offlineShell;
    }
    return new Response('NexSocket is offline. Launch the app to access cached controls.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Stale-While-Revalidate: Serve from cache immediately, update cache in
 * background from network.
 */
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached); // fall back to stale on network error

  return cached || networkFetch;
}
