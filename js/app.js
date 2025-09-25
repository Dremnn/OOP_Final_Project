document.addEventListener('DOMContentLoaded', () => {

    // Initialize managers
    const authManager = new AuthManager();
    const productManager = new ProductManager();
    const cartManager = new CartManager();
    const orderManager = new OrderManager();
    const uiManager = new UIManager();
    
    // --- STATE ---
    let currentUser = null;

    // --- FUNCTIONS ---

    function initialize() {
        currentUser = authManager.getCurrentUser();
        if (currentUser) {
            uiManager.showApp();
            uiManager.renderUserInfo(currentUser);
            loadProducts();
            loadCart();
            loadOrders();
        } else {
            uiManager.showAuth();
        }
        setupEventListeners();
    }

    function loadProducts() {
        const products = productManager.getProducts();
        const isAdmin = authManager.isUserAdmin();
        uiManager.renderProducts(products, isAdmin, handleAddToCart, handleEditProduct, handleDeleteProduct);
    }
    
    function loadCart() {
        const cart = cartManager.getCart();
        const total = cartManager.getCartTotal();
        uiManager.renderCart(cart, total, handleUpdateQuantity, handleRemoveFromCart);
    }

    function loadOrders() {
        const isAdmin = authManager.isUserAdmin();
        const orders = isAdmin ? orderManager.getAllOrders() : orderManager.getOrdersByUser(currentUser.username);
        uiManager.renderOrders(orders, isAdmin, handleUpdateOrderStatus);
    }

    // --- EVENT HANDLERS ---
    
    function handleLogin(e) {
        e.preventDefault();
        const username = e.target.loginUsername.value;
        const password = e.target.loginPassword.value;
        try {
            currentUser = authManager.login(username, password);
            initialize();
        } catch (error) {
            uiManager.showAlert(error.message);
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const username = e.target.registerUsername.value;
        const password = e.target.registerPassword.value;
        try {
            authManager.register(username, password);
            uiManager.showAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            uiManager.showLogin();
            e.target.reset();
        } catch (error) {
            uiManager.showAlert(error.message);
        }
    }

    function handleLogout() {
        authManager.logout();
        currentUser = null;
        initialize();
    }

    function handleProductFormSubmit(e) {
        e.preventDefault();
        const id = e.target.productId.value;
        const name = e.target.productName.value;
        const price = e.target.productPrice.value;
        const image = e.target.productImage.value;
        const description = e.target.productDescription.value;

        try {
            if (id) {
                productManager.updateProduct(id, name, price, image, description);
                 uiManager.showAppAlert('Cập nhật sản phẩm thành công!');
            } else {
                productManager.addProduct(name, price, image, description);
                uiManager.showAppAlert('Thêm sản phẩm thành công!');
            }
            uiManager.closeProductModal();
            loadProducts();
        } catch(error) {
            uiManager.showAppAlert(error.message, 'danger');
        }
    }
    
    function handleAddToCart(productId) {
        const product = productManager.getProductById(productId);
        if (product) {
            cartManager.addToCart(product);
            loadCart();
            uiManager.showAppAlert(`Đã thêm "${product.name}" vào giỏ hàng.`);
        }
    }

    function handleUpdateQuantity(productId, quantity) {
        cartManager.updateQuantity(productId, quantity);
        loadCart();
    }
    
    function handleRemoveFromCart(productId) {
        cartManager.removeFromCart(productId);
        loadCart();
    }

    function handleEditProduct(productId) {
        const product = productManager.getProductById(productId);
        if (product) {
            uiManager.openProductModal(product);
        }
    }
    
    function handleDeleteProduct(productId) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                productManager.deleteProduct(productId);
                uiManager.showAppAlert('Đã xóa sản phẩm.');
                loadProducts();
            } catch (error) {
                uiManager.showAppAlert(error.message, 'danger');
            }
        }
    }

    function handleCheckout() {
        try {
            const cart = cartManager.getCart();
            const total = cartManager.getCartTotal();
            const order = orderManager.placeOrder(currentUser.username, cart, total);
            cartManager.clearCart();
            loadCart();
            loadOrders();
            uiManager.showAppAlert(`Đặt hàng thành công! Mã đơn hàng: #${order.id.substr(-6)}`, 'success');
        } catch (error) {
            uiManager.showAppAlert(error.message, 'danger');
        }
    }

    function handleUpdateOrderStatus(orderId, status) {
        try {
            orderManager.updateOrderStatus(orderId, status);
            uiManager.showAppAlert(`Cập nhật trạng thái đơn hàng #${orderId.substr(-6)} thành công.`);
            // No need to reload all orders, could optimize this later
            loadOrders();
        } catch(error) {
            uiManager.showAppAlert(error.message, 'danger');
        }
    }

    // --- SETUP LISTENERS (run once) ---

    function setupEventListeners() {
        // Auth
        uiManager.loginForm.addEventListener('submit', handleLogin);
        uiManager.registerForm.addEventListener('submit', handleRegister);
        uiManager.showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); uiManager.showRegister(); });
        uiManager.showLoginLink.addEventListener('click', (e) => { e.preventDefault(); uiManager.showLogin(); });
        
        // This check is to avoid adding listeners multiple times
        if (!document.getElementById('logoutButton')._eventAttached) {
             document.getElementById('logoutButton').addEventListener('click', handleLogout);
             document.getElementById('logoutButton')._eventAttached = true;
        }

        // Product Modal
        if (!document.getElementById('addProductBtn')._eventAttached) {
            document.getElementById('addProductBtn').addEventListener('click', () => uiManager.openProductModal());
            document.getElementById('addProductBtn')._eventAttached = true;
        }

        uiManager.productForm.addEventListener('submit', handleProductFormSubmit);
        uiManager.closeProductModalBtn.addEventListener('click', () => uiManager.closeProductModal());

        // Checkout
        if (!uiManager.checkoutBtn._eventAttached) {
            uiManager.checkoutBtn.addEventListener('click', handleCheckout);
            uiManager.checkoutBtn._eventAttached = true;
        }
        
        // Close modal on outside click
        window.addEventListener('click', (event) => {
            if (event.target === uiManager.productModal) {
                uiManager.closeProductModal();
            }
        });
    }

    // --- START ---
    initialize();
});
