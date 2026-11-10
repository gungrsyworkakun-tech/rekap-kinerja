/* Rekap Kerja - service worker.
   Halaman utama selalu diambil dari internet lebih dulu (jadi update langsung terpakai).
   Kalau internet mati, dipakai salinan terakhir. Panggilan ke server (Apps Script) tidak disentuh. */
var CACHE='rekap-kerja-v1';
var INTI=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(INTI).catch(function(){}); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  var r=e.request, u=new URL(r.url);
  if(r.method!=='GET' || u.origin!==self.location.origin) return;
  e.respondWith(
    fetch(r,{cache:'no-cache'}).then(function(res){
      if(res&&res.ok){ var kp=res.clone(); caches.open(CACHE).then(function(c){ c.put(r,kp); }); }
      return res;
    }).catch(function(){ return caches.match(r).then(function(m){ return m||caches.match('./index.html'); }); })
  );
});

