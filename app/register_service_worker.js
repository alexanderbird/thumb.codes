if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service_worker.js')
      .catch(error => console.log('Couldn\'t register service worker: ', error));
  });
}
