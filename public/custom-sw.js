self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    const data = event.data ? event.data.json() : { title: 'Heylon System', body: 'New Alert' };

    const options = {
        body: data.body || 'System Alert',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png', // Helper badge
        vibrate: [200, 100, 200, 100, 200, 100, 200], // HEAVY Vibration pattern
        tag: data.tag || 'system-alert',
        renotify: true,
        data: {
            dateOfArrival: Date.now(),
            url: data.url || '/'
        },
        actions: [
            { action: 'view', title: 'View Signal' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Heylon Alert', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (windowClients) {
            // If app open, focus it
            for (let i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/');
            }
        })
    );
});
