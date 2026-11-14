'use strict';

// Change the version whenever any precached file changes.
const scope = self.registration.scope;
const prefix = 'vegas-calculator:' + scope + ':';
const cacheName = prefix + 'v1';
const page = new URL('index.html', scope).href;
const assets = new Set([
  'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'
].map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  const requests = [...assets].map(url => new Request(url, {cache:'reload'}));
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(requests)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const pathname = url.origin + url.pathname;
  const isEntry = request.mode === 'navigate' && (pathname === scope || pathname === page);
  const key = isEntry ? page : request.url;
  if (!assets.has(key)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key) || fetch(request);
  })());
});
