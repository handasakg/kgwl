/* Service worker – מערכת ניהול ובקרה חשבות
   הדף עצמו תמיד נטען מהרשת (כדי שעדכונים יופיעו מיד); רק כשאין חיבור – מוצג העותק האחרון.
   האייקונים והמניפסט נשמרים במטמון. בקשות לשרתים אחרים (Firebase, Drive וכו') לא עוברות כאן. */
const CACHE = 'hashavot-20261104e';
const STATIC = ['./icon-192.png?v=4', './icon-512.png?v=4', './apple-touch-icon.png?v=4', './favicon-32.png?v=4', './icon.svg?v=4'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => { })); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put('./', c)).catch(() => { }); return res; })
      .catch(() => caches.match('./').then(m => m || caches.match(r))));
    return;
  }
  if (/\.(png|ico|svg)$|manifest\.webmanifest/.test(u.pathname)) e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
