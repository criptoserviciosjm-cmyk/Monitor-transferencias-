const CACHE = "invjb-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/rates.json",
  "/manifest.webmanifest",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // For rates.json: network-first to show latest
  if (url.pathname.endsWith("/rates.json")) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put("/rates.json", copy));
        return res;
      }).catch(() => caches.match("/rates.json"))
    );
    return;
  }

  // For others: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
