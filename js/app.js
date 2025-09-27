// app.js - Fixed version
import { UserManager } from './managers/UserManager.js';
import { ProductManager } from './managers/ProductManager.js';
import { CartManager } from './managers/CartManager.js';
import { OrderManager } from './managers/OrderManager.js';
import { UIManager } from './managers/UIManager.js';
import { UserRole, ProductType, OrderType } from './constants.js';

export class CoffeeShopApplication {
    constructor() {
        this.userManager = new UserManager();
        this.productManager = new ProductManager(this.userManager);
        this.cartManager = new CartManager(this.userManager, this.productManager);
        this.orderManager = new OrderManager(this.userManager, this.productManager, this.cartManager);
        this.uiManager = new UIManager(this);
        this.currentSession = null;
    }

    initialize() {
        try {
            // Create default admin user
            this.userManager.registerUser("admin", "admin123", "0123456789", UserRole.ADMIN);
            const adminToken = this.userManager.login("admin", "admin123");
            
            // Add sample products with correct parameter order: name, description, price, type, specificData, sessionToken, imageUrl
            this.productManager.createProduct(
                "Cappuccino", 
                "Rich coffee with steamed milk foam", 
                45000, 
                ProductType.DRINK, 
                {size: "M", isHot: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop"
            );
            
            this.productManager.createProduct(
                "Espresso", 
                "Strong black coffee shot", 
                35000, 
                ProductType.DRINK, 
                {size: "S", isHot: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1510707577316-7e367ae3ba67?w=300&h=200&fit=crop"
            );
            
            this.productManager.createProduct(
                "Iced Latte", 
                "Smooth coffee with cold milk and ice", 
                50000, 
                ProductType.DRINK, 
                {size: "L", isHot: false}, 
                adminToken,
                "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop"
            );

            this.productManager.createProduct(
                "Vietnamese Drip Coffee", 
                "Traditional Vietnamese coffee with condensed milk", 
                40000, 
                ProductType.DRINK, 
                {size: "M", isHot: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&h=200&fit=crop"
            );
            
            this.productManager.createProduct(
                "Croissant", 
                "Buttery and flaky French pastry", 
                25000, 
                ProductType.FOOD, 
                {isVegetarian: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1555507036-ab794f77665a?w=300&h=200&fit=crop"
            );
            
            this.productManager.createProduct(
                "Veggie Sandwich", 
                "Fresh vegetables in whole grain bread", 
                35000, 
                ProductType.FOOD, 
                {isVegetarian: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop"
            );

            this.productManager.createProduct(
                "Chicken Banh Mi", 
                "Vietnamese baguette with grilled chicken", 
                45000, 
                ProductType.FOOD, 
                {isVegetarian: false}, 
                adminToken,
                "https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop"
            );

            this.productManager.createProduct(
                "Chocolate Muffin", 
                "Rich chocolate chip muffin", 
                30000, 
                ProductType.FOOD, 
                {isVegetarian: true}, 
                adminToken,
                "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=300&h=200&fit=crop"
            );

            // Logout admin after initialization
            this.userManager.logout(adminToken);
            
            // Setup UI event listeners
            this.uiManager.setupEventListeners();
            
            console.log("Application initialized successfully.");
            
            // Show demo information
            this.showDemoInfo();
            
        } catch (error) {
            console.error("Error initializing application:", error.message);
            this.uiManager.showAlert("Failed to initialize application: " + error.message);
        }
    }

    showDemoInfo() {
        const authAlert = document.getElementById('authAlert');
        if (authAlert) {
            authAlert.innerHTML = `
                <div class="alert alert-success">
                    <strong>🎯 Demo Account:</strong><br>
                    <strong>Admin:</strong> username "admin", password "admin123"<br>
                    <strong>Customer:</strong> Register now to start shopping! (Default role: Customer)
                </div>
            `;
        }
    }

    // Getter methods for managers (useful for UI)
    getUserManager() {
        return this.userManager;
    }

    getProductManager() {
        return this.productManager;
    }

    getCartManager() {
        return this.cartManager;
    }

    getOrderManager() {
        return this.orderManager;
    }

    getUIManager() {
        return this.uiManager;
    }

    // Session management
    setCurrentSession(sessionToken) {
        this.currentSession = sessionToken;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    clearCurrentSession() {
        this.currentSession = null;
    }

    // Helper method to check if current user is authenticated
    isAuthenticated() {
        return this.currentSession !== null && this.userManager.getCurrentUser(this.currentSession) !== null;
    }

    // Helper method to get current user
    getCurrentUser() {
        if (this.currentSession) {
            return this.userManager.getCurrentUser(this.currentSession);
        }
        return null;
    }

    // Helper method to check if current user is admin
    isCurrentUserAdmin() {
        return this.userManager.isAdmin(this.currentSession);
    }

    // Application lifecycle methods
    start() {
        console.log("Coffee Shop Application starting...");
        this.initialize();
        console.log("Coffee Shop Application started successfully.");
    }

    shutdown() {
        console.log("Coffee Shop Application shutting down...");
        if (this.currentSession) {
            this.userManager.logout(this.currentSession);
            this.currentSession = null;
        }
        console.log("Coffee Shop Application shut down complete.");
    }
}

// Create global application instance
const app = new CoffeeShopApplication();

// Make app available globally for UI functions
window.app = app;
window.uiManager = app.getUIManager();

// Global UI functions that will be called from HTML - updated to match UIManager methods
window.switchAuthTab = (tab) => app.uiManager.switchAuthTab(tab);
window.login = () => app.uiManager.login();
window.register = () => app.uiManager.register();
window.logout = () => app.uiManager.logout();
window.addToCart = (productId, quantity, size = 'M') => app.uiManager.addToCart(productId, quantity, size);
window.updateCartQuantity = (itemId, newQuantity) => app.uiManager.updateCartQuantity(itemId, newQuantity);
window.updateOrderStatus = (orderId, newStatus) => app.uiManager.updateOrderStatus(orderId, newStatus);
window.openProductModal = (productId) => app.uiManager.openProductModal(productId);
window.closeProductModal = () => app.uiManager.closeProductModal();
window.toggleProductTypeFields = () => app.uiManager.toggleProductTypeFields();
window.saveProduct = () => app.uiManager.saveProduct();
window.editProduct = (productId) => app.uiManager.editProduct(productId);
window.deleteProduct = (productId) => app.uiManager.deleteProduct(productId);
window.openCheckoutModal = () => app.uiManager.openCheckoutModal();
window.closeCheckoutModal = () => app.uiManager.closeCheckoutModal();
window.toggleOrderFields = () => app.uiManager.toggleOrderFields();
window.placeOrder = () => app.uiManager.placeOrder();
window.filterProducts = (type) => app.uiManager.filterProducts(type);

// ADD these new global functions:
window.addToCartWithSize = (productId) => app.uiManager.addToCartWithSize(productId);
window.updateCheckoutItemSize = (itemId, newSize) => app.uiManager.updateCheckoutItemSize(itemId, newSize);

// Initialize application when page loads
window.addEventListener('DOMContentLoaded', () => {
    app.start();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.shutdown();
});

export default app;