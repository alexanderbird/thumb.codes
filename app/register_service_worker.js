if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service_worker.js')
      .then(registration => console.log('Registered service worker with scope: ', registration.scope))
      .catch(error => console.log('Couldn\'t register service worker: ', error));
  });
}
