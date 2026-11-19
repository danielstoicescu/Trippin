// Service worker: aplicația se deschide și fără semnal (pe munte, pe traseu, în tren).
const VERSION = '202611192010';
const CACHE = `tva-transilvania-${VERSION}`;
const ASSETS = [
  '/transilvania/', '/transilvania/index.html', '/transilvania/app.js', '/transilvania/data.js', '/transilvania/icons.js', '/transilvania/version.js', '/transilvania/styles.css', '/transilvania/firebase-config.js', '/transilvania/manifest.webmanifest',
  '/transilvania/icon.svg', '/transilvania/icon-192.png', '/transilvania/icon-512.png',
  '/transilvania/vendor/leaflet/leaflet.js', '/transilvania/vendor/leaflet/leaflet.css', '/transilvania/vendor/fonts/fonts.css', '/transilvania/vendor/fonts/google-sans-latin-wght-normal.woff2', '/transilvania/vendor/fonts/silkscreen-latin-400-normal.woff2', '/transilvania/vendor/fonts/silkscreen-latin-700-normal.woff2', '/transilvania/vendor/fonts/silkscreen-latin-ext-400-normal.woff2', '/transilvania/vendor/fonts/silkscreen-latin-ext-700-normal.woff2', '/transilvania/vendor/fonts/google-sans-latin-ext-wght-normal.woff2',
];
const CACHE_CROSS = [/^https:\/\/www\.gstatic\.com\/firebasejs\//, /^https:\/\/(commons|upload)\.wikimedia\.org\/(wiki\/Special:FilePath|wikipedia\/commons)\//, /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\//];

self.addEventListener('install', (e) => {
  // cache: 'reload' = ocolește cache-ul HTTP al browserului, ca versiunea nouă să nu precacheze fișiere vechi
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('tva-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin && (url.pathname.startsWith('/__/') || !url.pathname.startsWith('/transilvania'))) return; // Firebase reserved URLs: mereu din rețea
  const cross = CACHE_CROSS.some((re) => re.test(req.url));
  if (!sameOrigin && !cross) return; // Firestore, Open-Meteo, QR etc.: direct

  if (req.mode === 'navigate') {
    // pagina: rețea întâi, cache dacă nu e semnal
    e.respondWith(fetch(req).then((res) => { caches.open(CACHE).then((c) => c.put('/transilvania/index.html', res.clone())); return res; }).catch(() => caches.match('/transilvania/index.html')));
    return;
  }
  // restul: cache întâi, actualizare în fundal
  e.respondWith(caches.match(req).then((cached) => {
    const network = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; }).catch(() => cached);
    return cached || network;
  }));
});
