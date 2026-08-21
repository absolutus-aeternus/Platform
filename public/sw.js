const CACHE_NAME = 'alliancehub-v2';
const STATIC_CACHE = 'alliancehub-static-v2';
const DYNAMIC_CACHE = 'alliancehub-dynamic-v2';
const API_CACHE = 'alliancehub-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo-alliance.svg',
  '/offline.html',
];

const CACHEABLE_API_PATHS = [
  '/api/products',
  '/api/categories',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !currentCaches.includes(k))
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // API calls: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages: network-first with offline fallback
  event.respondWith(networkFirstWithOffline(request));
});

// Strategy: Cache First
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache-first fetch failed:', request.url);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Strategy: Network First with Cache (TTL: 5 min for API)
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      // Add timestamp header for TTL checking
      const headers = new Headers(response.headers);
      headers.set('X-Cached-At', Date.now().toString());
      const timedResponse = new Response(await response.clone().blob(), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      cache.put(request, timedResponse);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) {
      const cachedAt = parseInt(cached.headers.get('X-Cached-At') || '0');
      if (Date.now() - cachedAt < API_CACHE_TTL) {
        return cached;
      }
      // Cache expired, try network again or return stale
      console.warn('[SW] API cache expired for:', request.url);
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Strategy: Network First with Offline Fallback (for HTML)
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Background Sync for orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    // Open IndexedDB and retry pending orders
    const db = await openDB();
    const tx = db.transaction('pending-orders', 'readonly');
    const store = tx.objectStore('pending-orders');
    const orders = await getAllFromStore(store);

    for (const order of orders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });

        if (response.ok) {
          // Remove from pending on success
          const deleteTx = db.transaction('pending-orders', 'readwrite');
          deleteTx.objectStore('pending-orders').delete(order.id);
        }
      } catch (err) {
        console.warn('[SW] Order sync failed, will retry:', order.id);
      }
    }
  } catch (err) {
    console.warn('[SW] Background sync error:', err);
  }
}

// IndexedDB helpers for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('alliancehub-offline', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
