self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('thumb.codes').then(function(cache) {
      return cache.addAll(
        [
          '/app.css',
          '/app.js',
          '/emoji.json',
          '/index.html',
        ]
      );
    })
  );
});

