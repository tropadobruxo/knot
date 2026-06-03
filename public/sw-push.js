const CACHE_NAME = "knot-v2";
const STATIC_ASSETS = [
  "/",
  "/discover",
  "/matches",
  "/events",
  "/groups",
  "/search",
  "/premium",
  "/welcome",
  "/offline",
  "/icon.svg",
  "/icon-discreet.svg",
];

// Install: pre-cache static pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API routes: network only (don't cache)
  if (url.pathname.startsWith("/api/")) return;

  // Static assets and pages: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetched = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Offline: return cached if available
          if (cached) return cached;
          // For navigation requests, show offline page
          if (request.mode === "navigate") {
            return cache.match("/offline") || cache.match("/") || new Response("Offline", { status: 503 });
          }
          return new Response("Offline", { status: 503 });
        });

        return cached || fetched;
      })
    )
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Knot";
    const options = {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // ignore
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
