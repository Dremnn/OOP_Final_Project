// Import tất cả các lớp Manager cần thiết
import UIManager from './managers/UIManager.js';
import ProductManager from './managers/ProductManager.js';
import CartManager from './managers/CartManager.js';
import OrderManager from './managers/OrderManager.js';
import UserManager from './managers/UserManager.js';
import { DBService } from './services/DBService.js';

/**
 * Lớp App: Điểm khởi đầu, đóng vai trò "nhạc trưởng", điều phối toàn bộ ứng dụng.
 */
class App {
    constructor() {
        // Khởi tạo tất cả các lớp quản lý
        this.uiManager = new UIManager();
        this.productManager = new ProductManager();
        this.cartManager = new CartManager();
        this.orderManager = new OrderManager();
        this.userManager = new UserManager();
    }

    /**
     * Phương thức khởi chạy chính của ứng dụng.
     */
    async init() {
        this.uiManager.showLoading();
        this.setupEventListeners();
        this.registerServiceWorker();
        await DBService.initDB();

        // Kiểm tra xem có phiên đăng nhập cũ không
        const sessionResumed = await this.userManager.resumeSession();
        if (sessionResumed) {
            // Nếu có, khởi tạo ứng dụng chính
            await this.initializeApp();
        } else {
            // Nếu không, hiển thị trang đăng nhập
            this.uiManager.showPage('login-page');
        }
        this.uiManager.hideLoading();
    }

    /**
     * Khởi tạo các thành phần chính của ứng dụng sau khi đăng nhập thành công.
     */
    async initializeApp() {
        this.uiManager.updateProfile(this.userManager.currentUser);
        
        const products = await this.productManager.loadProducts();
        this.uiManager.renderProducts(products, this.userManager.currentUser);

        // Chỉ tải đơn hàng nếu là customer
        if (this.userManager.currentUser.role === 'customer') {
            const orders = await this.orderManager.loadOrders();
            this.uiManager.renderOrders(orders);
        }
        
        this.uiManager.updateCart(this.cartManager);
        this.uiManager.showPage('home-page');
        this.uiManager.updateActiveNav('home-page');
    }

    /**
     * Cài đặt tất cả các trình lắng nghe sự kiện cho ứng dụng.
     */
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.uiManager.showLoading();
            const username = e.target.elements.username.value;
            const password = e.target.elements.password.value;
            const success = await this.userManager.login(username, password);
            if (success) {
                await this.initializeApp();
            } else {
                // Xử lý lỗi đăng nhập ở đây
            }
            this.uiManager.hideLoading();
        });

        document.getElementById('logout-button')?.addEventListener('click', () => {
            this.userManager.logout();
            this.uiManager.showPage('login-page');
        });

        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.uiManager.showProductModal(null);
        });        

        // Xử lý điều hướng bằng nav bar
        this.uiManager.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = item.dataset.page;
                this.uiManager.showPage(pageId);
                this.uiManager.updateActiveNav(pageId);
            });
        });

        // Xử lý sự kiện "Thêm vào giỏ hàng"
        this.uiManager.elements.productList.addEventListener('click', e => {
            const button = e.target.closest('.btn-add-to-cart');
            if (button) {
                const productId = button.dataset.productId;
                const product = this.productManager.getProductById(productId);
                if (product) {
                    this.cartManager.addItem(product);
                    this.uiManager.updateCart(this.cartManager);
                }
            }
        });

        // Mở/đóng modal giỏ hàng
        this.uiManager.elements.cartButton.addEventListener('click', () => this.uiManager.toggleCartModal(true));
        document.getElementById('close-modal-button')?.addEventListener('click', () => this.uiManager.toggleCartModal(false));
        this.uiManager.elements.cartModal.addEventListener('click', e => {
            if (e.target === this.uiManager.elements.cartModal) {
                 this.uiManager.toggleCartModal(false);
            }
        });

        // Xử lý sự kiện "Đặt hàng"
        this.uiManager.elements.checkoutButton.addEventListener('click', async () => {
            const newOrder = await this.orderManager.createOrder(this.cartManager);
            if (newOrder) {
                await this.userManager.addPointsForOrder(newOrder.total);
                this.cartManager.clear();
                
                this.uiManager.updateCart(this.cartManager);
                this.uiManager.toggleCartModal(false);
                this.uiManager.renderOrders(this.orderManager.orders);
                this.uiManager.updateProfile(this.userManager.currentUser);
                
                alert('Đặt hàng thành công!');
                this.uiManager.showPage('orders-page');
                this.uiManager.updateActiveNav('orders-page');
            }
        });

        // SỰ KIỆN ADMIN: Xử lý Sửa và Xóa sản phẩm
        this.uiManager.elements.productList.addEventListener('click', async e => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const addBtn = e.target.closest('.btn-add-to-cart');

            if (editBtn) {
                const productId = editBtn.dataset.productId;
                const product = this.productManager.getProductById(productId);
                this.uiManager.showProductModal(product);
            } else if (deleteBtn) {
                const productId = deleteBtn.dataset.productId;
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                    await this.productManager.deleteProduct(productId);
                    // Render lại danh sách sản phẩm
                    this.uiManager.renderProducts(this.productManager.products, this.userManager.currentUser);
                }
            } else if (addBtn) {
                // Logic thêm vào giỏ hàng của customer (đã có từ trước)
            }
        });

        // SỰ KIỆN ADMIN: Xử lý submit form Thêm/Sửa sản phẩm
        this.uiManager.elements.productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Lấy dữ liệu từ form và chuyển đổi
            const productData = {
                id: e.target.elements['product-id'].value,
                type: e.target.elements['product-type'].value,
                name: e.target.elements['product-name'].value,
                price: parseInt(e.target.elements['product-price'].value, 10),
                imageUrl: e.target.elements['product-image'].value,
                description: e.target.elements['product-desc'].value,
                size: e.target.elements['product-size'].value,
                isVegetarian: e.target.elements['product-vegetarian'].checked,
            };

            if (productData.id) { // Nếu có ID -> Sửa
                await this.productManager.updateProduct(productData);
            } else { // Nếu không có ID -> Thêm mới
                await this.productManager.addProduct(productData);
            }

            this.uiManager.hideProductModal();
            // Tải lại toàn bộ sản phẩm từ DB để đảm bảo đồng bộ và render lại
            await this.productManager.loadProducts();
            this.uiManager.renderProducts(this.productManager.products, this.userManager.currentUser);
        });

        // Đóng modal admin
        document.getElementById('close-product-modal-btn')?.addEventListener('click', () => this.uiManager.hideProductModal());
        // Thay đổi trường hiển thị khi chọn type
        this.uiManager.elements.productType.addEventListener('change', () => this.uiManager.toggleProductTypeFields());
        
    }

    /**
     * Đăng ký Service Worker để bật tính năng PWA.
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('Service Worker đã đăng ký.'))
                    .catch(err => console.log('Đăng ký Service Worker thất bại: ', err));
            });
        }
    }
}

// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

