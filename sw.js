/* Rekap Kerja - service worker v2: buka instan dari simpanan, perbarui di belakang layar. */
var CACHE = 'rekap-kerja-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function kabari() {
  self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { c.postMessage({ t: 'baru' }); }); });
}
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;   // panggilan ke Apps Script tidak disentuh
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(r, { ignoreSearch: r.mode === 'navigate' }).then(function (lama) {
      var baru = fetch(r).then(function (res) {
        if (res && res.ok) {
          var salinan = res.clone();
          if (lama) {
            res.clone().text().then(function (t) { return lama.clone().text().then(function (o) { if (t !== o) kabari(); }); }).catch(function () {});
          }
          c.put(r, salinan);
        }
        return res;
      }).catch(function () { return lama; });
      return lama || baru;
    });
  }));
});
