/* Service worker – "ניהול ובקרה חשבות"
   קודם רשת, ואז מטמון: כל עדכון של index.html מופיע מיד כשיש אינטרנט, והאתר עדיין נפתח בלי אינטרנט. */
const CACHE = 'hb-20261104b';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);   /* מוחק מטמונים של גרסאות קודמות */
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   /* Firebase, CDN וכו' – ישירות לרשת */
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-store' });
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (err) {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') { const idx = await caches.match('index.html', { ignoreSearch: true }) || await caches.match('./', { ignoreSearch: true }); if (idx) return idx; }
      throw err;
    }
  })());
});
