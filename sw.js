const CACHE_NAME = "camping-classics-consent-20261126";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./vendor/leaflet.min.js",
  "./vendor/leaflet.css",
  "./privacy.html",
  "./terms.html",
  "./assets/camp-sunrise.jpg",
  "./assets/camp-forest.jpg",
  "./assets/camp-night.jpg",
  "./styles.css?v=consent-20261126",
  "./hero-photos.js?v=consent-20261126",
  "./card-browser.css?v=58",
  "./card-browser.js?v=58",
  "./script.js?v=consent-20261126",
  "./manifest.webmanifest",
  "./privacy.js?v=consent-20261126",
  "./excel.js?v=57",
  "./excel-worker.js",
  "./vendor/xlsx-0.20.3.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("camping-classics-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only cache this site's own assets. External campground/data calls remain network-first.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return networkFetch.then(response => response || cached || Response.error());
    })
  );
});
