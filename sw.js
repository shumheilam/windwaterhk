/* ── FengShui Oracle Service Worker ── */

const CACHE_NAME = 'fengshui-oracle-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/oracle.html',
  '/calendar.html',
  '/qimen.html',
  '/compass.html',
  '/icon-bagua-192.png',
  '/icon-bagua-512.png',
  '/manifest.json'
];

// Install: 預緩存靜態資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: 清除舊緩存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network First，失敗先用緩存
self.addEventListener('fetch', event => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') return;

  // 唔緩存 API 請求
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功就更新緩存
        const clone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // 網絡失敗就用緩存（離線模式）
        return caches.match(event.request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});

// Push Notification: 接收伺服器推送（Phase 4 用）
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '風生水起';
  const options = {
    body: data.body || '',
    icon: '/icon-bagua.png',
    badge: '/icon-bagua.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click: 打開 / 聚焦 App
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

// Message: 處理頁面發出嘅本地通知請求
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icon-bagua.png',
      badge: '/icon-bagua.png',
      tag: tag || 'fso-notif',
      data: { url: url || '/' },
      vibrate: [200, 100, 200],
    });
  }
});
