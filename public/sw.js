self.addEventListener('fetch', event => {
  // Skip POST/caching dynamic content
  if (event.request.method !== 'GET') {
    return;
  }
  // Cache static only
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});