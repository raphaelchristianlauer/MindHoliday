// MindHoliday Service Worker – minimal, kein aggressives Caching
const CACHE_NAME = 'mindholiday-v1777107205';

// Bei Installation alten Cache löschen
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Bei Aktivierung ALLE alten Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: immer zuerst Netzwerk, dann Cache als Fallback
self.addEventListener('fetch', (event) => {
  // Supabase und CDN immer live laden
  if (event.request.url.includes('supabase') || 
      event.request.url.includes('cdn.jsdelivr')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Frische Antwort im Cache speichern
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'MindHoliday', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
