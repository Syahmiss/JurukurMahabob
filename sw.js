/* ============================================================
   JMC Operations Hub — Service Worker (PWA)
   - HTML (hub & modul): network-first → kemas kini GitHub terus nampak,
     cache cuma jadi sandaran bila offline.
   - CDN (font, ikon, Chart.js, Tailwind, PapaParse): stale-while-revalidate.
   - Data Google (Apps Script, Sheets CSV, Drive): TIDAK disentuh langsung.
     Sengaja — supaya data jualan/invois tak tersimpan dalam cache telefon
     dan dashboard tak papar data lapuk.
   Bila ubah fail ini, naikkan VERSION supaya cache lama dibuang.
   ============================================================ */
const VERSION = 'jmc-v2';
const CORE = `${VERSION}-core`;
const PAGES = `${VERSION}-pages`;
const CDN = `${VERSION}-cdn`;
const CDN_MAX = 60;

const CORE_FILES = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'cdn.tailwindcss.com',
  'unpkg.com'
];

// Jangan sekali-kali cache: data & auth
const BYPASS_HOSTS = [
  'script.google.com',
  'script.googleusercontent.com',
  'docs.google.com',
  'drive.google.com',
  'googleusercontent.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE).then((c) => c.addAll(CORE_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (BYPASS_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  // Fail dalam repo sendiri
  if (url.origin === self.location.origin) {
    // sw.js sendiri jangan cache
    if (url.pathname.endsWith('/sw.js')) return;
    if (req.mode === 'navigate' || req.destination === 'iframe' || req.destination === 'document') {
      e.respondWith(networkFirst(req));
    } else {
      e.respondWith(staleWhileRevalidate(req, PAGES));
    }
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req, CDN, CDN_MAX));
  }
  // Host lain: biar browser handle biasa
});

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(stripQuery(req), res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(stripQuery(req))) || (await caches.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    if (req.mode === 'navigate' || req.destination === 'iframe') {
      return (await caches.match('./offline.html')) || Response.error();
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req)
    .then((res) => {
      // opaque (status 0) dibenarkan untuk CSS/font cross-origin tanpa CORS
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(req, res.clone()).then(() => max && trim(cacheName, max));
      }
      return res;
    })
    .catch(() => null);
  return hit || (await net) || Response.error();
}

// ?source=pwa dsb tak patut buat entri cache berasingan
function stripQuery(req) {
  const u = new URL(req.url);
  u.search = '';
  u.hash = '';
  return u.toString();
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
