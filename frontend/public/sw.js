// Service Worker for SiteBoss - Offline and Background Sync

const CACHE_NAME = 'siteboss-v1';
const RUNTIME_CACHE = 'siteboss-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  // Add other critical assets
];

// API routes that can work offline
const OFFLINE_FALLBACK_ROUTES = [
  '/api/auth/profile',
  '/api/projects',
  '/api/tasks',
  '/api/budget'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests (static assets)
  event.respondWith(handleStaticAssets(request));
});

// API Request Handler with offline fallback
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', url.pathname);
    
    // For GET requests, try cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline fallback data for specific routes
      return getOfflineFallback(url.pathname);
    }
    
    // For POST/PUT/DELETE requests, return offline indicator
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Currently offline. Changes will be synced when connection is restored.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Navigation Request Handler
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Return cached app shell or offline page
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return caches.match('/offline.html');
  }
}

// Static Assets Handler
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    
    // Return fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#666">Image Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Offline fallback data for specific API routes
function getOfflineFallback(pathname) {
  const fallbackData = {
    '/api/auth/profile': {
      success: false,
      error: 'Profile data not available offline'
    },
    '/api/projects': {
      success: true,
      data: [],
      message: 'Projects will be loaded from offline storage'
    },
    '/api/tasks': {
      success: true,
      data: [],
      message: 'Tasks will be loaded from offline storage'
    }
  };

  const data = fallbackData[pathname] || {
    success: false,
    error: 'Data not available offline'
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  console.log('[SW] Performing background sync');
  
  // Notify the app to perform sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'BACKGROUND_SYNC',
      message: 'Starting background sync'
    });
  });
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: data.priority === 'high'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        
        // Open new window
        let url = '/dashboard';
        if (data && data.url) {
          url = data.url;
        }
        
        return clients.openWindow(url);
      })
  );
});

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'data-sync') {
    event.waitUntil(performPeriodicSync());
  }
});

async function performPeriodicSync() {
  console.log('[SW] Performing periodic sync');
  
  try {
    // Sync critical data in background
    const response = await fetch('/api/sync/critical');
    if (response.ok) {
      const data = await response.json();
      
      // Cache updated data
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put('/api/sync/critical', new Response(JSON.stringify(data)));
      
      console.log('[SW] Periodic sync completed');
    }
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
  }
}

// Share Target (for PWA)
self.addEventListener('share', (event) => {
  console.log('[SW] Share received:', event);
  
  event.waitUntil(
    handleShare(event.data)
  );
});

async function handleShare(shareData) {
  // Handle shared content (photos, files, etc.)
  const clients = await self.clients.matchAll();
  
  if (clients.length > 0) {
    clients[0].postMessage({
      type: 'SHARE_RECEIVED',
      data: shareData
    });
  } else {
    // Store shared data for when app opens
    await storeSharedData(shareData);
  }
}

async function storeSharedData(shareData) {
  // Store in IndexedDB for later retrieval
  // Implementation would depend on shared data structure
  console.log('[SW] Storing shared data for later:', shareData);
}

// Handle installation prompt
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('[SW] Before install prompt');
  
  // Prevent automatic prompt
  event.preventDefault();
  
  // Send to app to show custom install UI
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'INSTALL_PROMPT_AVAILABLE'
      });
    });
  });
});

// Clean up old caches periodically
setInterval(() => {
  cleanupOldCaches();
}, 24 * 60 * 60 * 1000); // Once per day

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      !name.includes('v1') && (name.includes('siteboss') || name.includes('runtime'))
    );
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('[SW] Cleaned up old caches:', oldCaches);
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Log service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded and ready');