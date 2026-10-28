const CACHE_NAME = "mediahub-pk-v1";

const OFFLINE_URL = "/Amir-ghaffar07/offline.html";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.add(OFFLINE_URL);
      } catch (error) {
        console.log("Offline page could not be cached yet.");
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(name => name.startsWith("mediahub-pk-") &&
                          name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedPage = await caches.match(event.request);

        if (cachedPage) return cachedPage;

        return await caches.match(OFFLINE_URL) ||
          new Response(
            "You are offline. Please connect to the internet and try again.",
            {
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
      })
    );
  }
});