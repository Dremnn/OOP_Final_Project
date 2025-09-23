const CACHE_NAME = 'highlands-pwa-v3'; // Nâng cấp phiên bản cache
// Danh sách đầy đủ các file cần thiết để ứng dụng chạy offline
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

// Sự kiện 'install': được gọi khi service worker được cài đặt lần đầu
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Sự kiện 'activate': được gọi khi service worker được kích hoạt
// Thường dùng để dọn dẹp các cache cũ
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.filter(name => name !== CACHE_NAME)
                      .map(name => caches.delete(name))
        );
    }));
});

// Sự kiện 'fetch': được gọi mỗi khi có một yêu cầu mạng từ ứng dụng
// Đây là nơi chúng ta triển khai chiến lược cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy request trong cache, trả về response từ cache
        if (response) {
          return response;
        }
        // Nếu không, thực hiện yêu cầu mạng thực sự
        return fetch(event.request);
      })
  );
});

