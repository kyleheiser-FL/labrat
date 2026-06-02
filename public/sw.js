/* LabRat root service worker for PWA install, offline shell, and PWABuilder detection. */
const CACHE_NAME = "labrat-pwa-v9-black-statusbar";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/manifest-neon.json",
  "/manifest-clinical.json",
  "/labrat_icon.svg",
  "/icon_192.png",
  "/icon_512.png",
  "/icon_maskable_512.png",
  "/pwa-icons/lr-clinical-192.png",
  "/pwa-icons/lr-clinical-512.png",
  "/pwa-icons/lr-neon-192.png",
  "/pwa-icons/lr-neon-512.png",
  "/labrat_hero_rat_dark.png",
  "/labrat_top_left_logo_transparent.png",
  "/screenshots/labrat-neon-wide-dashboard.png",
  "/screenshots/labrat-neon-wide-cycle.png",
  "/screenshots/labrat-neon-wide-compounds.png",
  "/screenshots/labrat-neon-mobile-dashboard.png",
  "/screenshots/labrat-neon-mobile-cycle.png",
  "/screenshots/labrat-neon-mobile-compounds.png",
  "/screenshots/labrat-clinical-wide-dashboard.png",
  "/screenshots/labrat-clinical-wide-cycle.png",
  "/screenshots/labrat-clinical-wide-compounds.png",
  "/screenshots/labrat-clinical-mobile-dashboard.png",
  "/screenshots/labrat-clinical-mobile-cycle.png",
  "/screenshots/labrat-clinical-mobile-compounds.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => cacheName === CACHE_NAME ? undefined : caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") return;
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname.startsWith("/__/auth/")) return;

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(async () => {
          return (await caches.match("/")) || (await caches.match("/index.html")) || new Response(
            "LabRat is offline. Please reconnect and reload.",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
          );
        })
    );
    return;
  }

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
        .catch(async () => {
          return cached || new Response("", { status: 504, statusText: "Offline" });
        });

      return cached || networkFetch;
    })
  );
});

/* ──────────────────────────────────────────────────────────
   OS banner notifications — triggered from the page via postMessage
   Routing through the SW guarantees the OS shows a real banner
   (vs. page-level Notification API which some OSes silently tray)
   ────────────────────────────────────────────────────────── */
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_NOTIFICATION") return;
  const { title, body, tag, icon, badge, vibrate, data } = event.data.payload || {};
  event.waitUntil(
    self.registration.showNotification(title || "LabRat", {
      body: body || "",
      icon: icon || "/icon_192.png",
      badge: badge || "/icon_96.png",
      tag: tag || "labrat-notification",
      renotify: true,
      requireInteraction: false,
      vibrate: vibrate || [200, 100, 200, 100, 200],
      data: data || {},
    })
  );
});

/* Web Push event — for future server-side push (FCM/VAPID) */
self.addEventListener("push", (event) => {
  let payload = { title: "LabRat", body: "You have a new notification." };
  try { if (event.data) payload = event.data.json(); } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body || "",
      icon: payload.icon || "/icon_192.png",
      badge: "/icon_96.png",
      tag: payload.tag || "labrat-push",
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200, 100, 200],
      data: payload.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
