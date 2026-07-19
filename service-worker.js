
const CACHE='expired-killer-v2';
const ASSETS=['./','index.html','style.css','app.js','config.json','manifest.json','logo.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
