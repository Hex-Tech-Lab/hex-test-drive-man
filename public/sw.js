/**
 * Service Worker for Offline Support
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Offline Support
 */

const CACHE_NAME = 'hex-test-drive-v1';
const MODELS_CACHE = 'face-models-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Face-api.js model files (will be cached on first use)
const MODEL_FILES = [
  '/models/tiny_face_detector_model-weights_manifest.json',
  '/models/tiny_face_detector_model-shard1',
  '/models/face_landmark_68_model-weights_manifest.json',
  '/models/face_landmark_68_model-shard1',
  '/models/face_recognition_model-weights_manifest.json',
  '/models/face_recognition_model-shard1',
  '/models/face_recognition_model-shard2',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MODELS_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  
  // Take control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle model files with dedicated cache
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.open(MODELS_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            console.log('[SW] Serving model from cache:', url.pathname);
            return response;
          }
          
          // Fetch and cache model file
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              console.log('[SW] Caching model:', url.pathname);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }),
    );
    return;
  }
  
  // Handle API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((response) => {
            if (response) {
              console.log('[SW] Serving API from cache:', url.pathname);
              return response;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          });
        }),
    );
    return;
  }
  
  // Handle static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    }),
  );
});

// Background sync for uploads
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'upload-id') {
    event.waitUntil(syncUploadID());
  }
  
  if (event.tag === 'upload-selfie') {
    event.waitUntil(syncUploadSelfie());
  }
});

// Sync upload ID
/**
 *
 */
async function syncUploadID() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const request = new Request('/api/upload-id-pending');
    const response = await cache.match(request);
    
    if (response) {
      const data = await response.json();
      
      // Retry upload
      const uploadResponse = await fetch('/api/upload-id', {
        method: 'POST',
        body: data.formData,
      });
      
      if (uploadResponse.ok) {
        // Remove from cache on success
        await cache.delete(request);
        console.log('[SW] ID upload synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync ID upload:', error);
  }
}

// Sync upload selfie
/**
 *
 */
async function syncUploadSelfie() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const request = new Request('/api/upload-selfie-pending');
    const response = await cache.match(request);
    
    if (response) {
      const data = await response.json();
      
      // Retry upload
      const uploadResponse = await fetch('/api/upload-selfie', {
        method: 'POST',
        body: data.formData,
      });
      
      if (uploadResponse.ok) {
        // Remove from cache on success
        await cache.delete(request);
        console.log('[SW] Selfie upload synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync selfie upload:', error);
  }
}

// Message handler
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_MODELS') {
    event.waitUntil(
      caches.open(MODELS_CACHE).then((cache) => {
        console.log('[SW] Pre-caching models');
        return cache.addAll(MODEL_FILES);
      }),
    );
  }
});
