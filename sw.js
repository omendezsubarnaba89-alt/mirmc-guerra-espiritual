const CACHE = 'mirmc-guerra-espiritual-v11-content-1';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './course-data.js',
  './course-progress.js',
  './course-enhancements.js',
  './course-index.css',
  './lesson.html',
  './lesson.css',
  './lesson.js',
  './resource-data.js',
  './library.html',
  './library.css',
  './library.js',
  './resource.html',
  './resource.js',
  './content-runtime.js',
  './assessment-data.js',
  './assessment-progress.js',
  './assessment.html',
  './assessment.css',
  './assessment.js',
  './academic.html',
  './academic.css',
  './academic.js',
  './certificate.html',
  './certificate.css',
  './certificate.js',
  './settings.html',
  './settings.css',
  './settings.js',
  './account.html',
  './account.css',
  './account.js',
  './admin.html',
  './admin.css',
  './admin.js',
  './admin-enhancements.js',
  './admin-user.html',
  './admin-user.js',
  './admin-detail.css',
  './admin-audit.html',
  './admin-audit.js',
  './admin-audit.css',
  './admin-content.html',
  './admin-content.css',
  './admin-content.js',
  './cloud-config.js',
  './cloud-client.js',
  './cloud-sync.js',
  './cloud-autosync.js',
  './study.html',
  './study.css',
  './study.js',
  './study-data.js',
  './study-tools.js',
  './study-tools.css',
  './assets/mirmc-shield.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match('./index.html'));
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || ['script','style','document'].includes(event.request.destination)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
