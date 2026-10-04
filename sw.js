const CACHE_NAME = "smartcare-shell-v25";
const APP_SHELL = [
  "./",
  "./index.html",
  "./theme-init.js",
  "./styles.css",
  "./script.js",
  "./hero-3d.js",
  "./manifest.json",
  "./icon.svg",
  "./gallery-clinic.svg",
  "./gallery-consultation.svg",
  "./gallery-community.svg",
  // Modules and Design Tokens
  "./src/tokens/design-tokens.css",
  "./src/config/content.js",
  "./src/js/components.js",
  "./src/js/init-components.js",
  "./src/js/animations.js",
  "./src/js/theme-toggle.js",
  "./src/js/theme-customizer.js",
  // Component Templates for Dynamic Offline Rendering
  "./src/components/badge.html",
  "./src/components/button.html",
  "./src/components/capability-card.html",
  "./src/components/card.html",
  "./src/components/faq-item.html",
  "./src/components/footer.html",
  "./src/components/input.html",
  "./src/components/modal.html",
  "./src/components/pricing-card.html",
  "./src/components/section-header.html",
  "./src/components/testimonial-card.html",
  "./src/components/tooltip.html",
  "./src/components/workflow-item.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => console.warn(`[SW] Pre-cache failed for ${url}:`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("./index.html");
          return new Response("Offline asset unavailable", { status: 503, statusText: "Offline" });
        });
    })
  );
});
