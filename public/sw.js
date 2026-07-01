const CACHE_NAME = "pacjent360-static-v1";
const PRECACHE_URLS = [
  "./",
  "index.html",
  "demo.html",
  "manifest.webmanifest",
  "patient360-flags.js",
  "brand/tokens.css",
  "brand/components.css",
  "assets/story.css",
  "assets/story.js",
  "assets/favicon.svg",
  "assets/hero-clinical-context.png",
  "p360-pwa.js"
];

const STATIC_PATH_PATTERN = /\.(?:html|css|js|png|svg|webmanifest|txt)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return;
  if (!STATIC_PATH_PATTERN.test(url.pathname) && url.pathname !== "/" && !url.pathname.endsWith("/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
