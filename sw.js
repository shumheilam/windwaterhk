/* ── FengShui Oracle Service Worker ── */

const CACHE_NAME = 'fso-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

// Handle push events from server (future use)
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '風生水起';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click — open / focus the app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Handle scheduled local notification messages from the page
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'fso-notif',
      data: { url: url || '/' },
      vibrate: [200, 100, 200],
    });
  }
});
