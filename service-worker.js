const CACHE_NAME = 'highlands-pwa-v4'; // Nâng cấp phiên bản cache
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  // Tất cả các class
  '/js/classes/User.js',
  '/js/classes/Customer.js',
  '/js/classes/Admin.js',
  '/js/classes/Product.js',
  '/js/classes/Order.js',
  '/js/classes/Drink.js',   
  '/js/classes/Food.js',    
  // Tất cả các manager
  '/js/managers/UIManager.js',
  '/js/managers/ProductManager.js',
  '/js/managers/CartManager.js',
  '/js/managers/OrderManager.js',
  '/js/managers/UserManager.js',
  // Tất cả các service
  '/js/services/ApiService.js',
  '/js/services/DBService.js',
  // Các tài nguyên khác
  '/images/logo-192.png',
  '/images/logo-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// Các event 'install', 'activate', 'fetch' giữ nguyên không đổi
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    }));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

