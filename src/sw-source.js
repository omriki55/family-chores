import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// ── Precache Vite build assets ──
precacheAndRoute(self.__WB_MANIFEST);

// ── Runtime caching strategies ──

// Navigation: network first, fallback to cache
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
  })
);

// Images: cache first (30 day expiry)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// JS/CSS: stale while revalidate
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({ cacheName: 'static-resources' })
);

// Fonts: cache first
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// ── Push Notifications ──
self.addEventListener('push', e => {
  const defaults = {
    title: 'משימות המשפחה 🏠',
    body: 'יש לך משימות ממתינות!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'he',
    tag: 'family-chores',
    renotify: true,
    actions: [
      { action: 'open', title: '📋 פתח' },
      { action: 'dismiss', title: '❌ סגור' },
    ],
  };

  let data = defaults;
  if (e.data) {
    try {
      const payload = e.data.json();
      data = { ...defaults, ...payload };
    } catch {
      data = { ...defaults, body: e.data.text() || defaults.body };
    }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      dir: data.dir,
      lang: data.lang,
      tag: data.tag,
      renotify: data.renotify,
      actions: data.actions,
      data: data.url || '/',
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();

  if (e.action === 'dismiss') return;

  const url = e.notification.data || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
