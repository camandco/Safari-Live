// Safari Live works without signal: every page, font and script is stored on the phone
// and served from there first, then refreshed quietly in the background.
const CACHE = 'safari-v20';
const TILES = 'safari-tiles';
const SHELL = ['./', 'index.html', 'tick.html', 'comp.html', 'help.html', 'app.css', 'common.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'fonts/inter-400.woff2', 'fonts/inter-500.woff2', 'fonts/inter-600.woff2', 'fonts/inter-700.woff2', 'fonts/dmserif.woff2',
  'vendor/leaflet.js', 'vendor/leaflet.css'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== TILES).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const refresh = (req) => fetch(req.url, { cache: 'no-cache' }).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req.url.split('?')[0], copy)); } return res; });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Stored copy first (instant, no signal needed); update the stored copy for next time.
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = refresh(req).catch(() => hit || caches.match('tick.html'));
      if (hit) { e.waitUntil(net); return hit; }
      return net;
    }));
  } else if (url.hostname.endsWith('tile.openstreetmap.org')) {
    // Map tiles you have looked at stay on the phone.
    e.respondWith(caches.open(TILES).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); c.keys().then((ks) => { if (ks.length > 600) ks.slice(0, ks.length - 600).forEach((k) => c.delete(k)); }); }
      return res;
    }))));
  }
});
