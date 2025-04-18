// Service worker for push notifications
const CACHE_NAME = 'notifications-v1';
const NOTIFICATION_ICON = '/icons/notification.png';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        NOTIFICATION_ICON,
        '/offline.html'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  let notificationData;
  try {
    notificationData = event.data?.json();
  } catch (e) {
    notificationData = {
      title: 'New notification',
      body: event.data?.text() || 'You have a new notification',
    };
  }

  const { title, body, icon, data } = notificationData;
  const options = {
    body: body || 'You have a new notification',
    icon: icon || NOTIFICATION_ICON,
    data: data || { url: '/' },
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    tag: data?.tag || 'default-notification', // Add tag for grouping notifications
    renotify: data?.renotify || false, // Whether to notify again for notifications with the same tag
  };

  event.waitUntil(
    self.registration.showNotification(title || 'New notification', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      return clients.openWindow(urlToOpen);
    })
  );
});