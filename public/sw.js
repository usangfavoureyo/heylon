// Heylon PWA Service Worker - Minimal working version
const CACHE_NAME = 'heylon-v1';

// Install event - just activate immediately
self.addEventListener('install', function (event) {
    console.log('[SW] Installing...');
    self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', function (event) {
    console.log('[SW] Activating...');
    event.waitUntil(clients.claim());
});

// Fetch event - network first, no caching for simplicity
// Fetch event - DISABLED to prevent freeze on launch
// self.addEventListener('fetch', function (event) {
//     event.respondWith(fetch(event.request));
// });

// Push notification handling
self.addEventListener('push', function (event) {
    console.log('[SW] Push Received.');
    const data = event.data ? event.data.json() : { title: 'Heylon System', body: 'New Alert' };

    const options = {
        body: data.body || 'System Alert',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'system-alert',
        renotify: true,
        data: { url: data.url || '/login' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Heylon Alert', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification clicked.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (windowClients) {
            for (let client of windowClients) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/login');
            }
        })
    );
});
