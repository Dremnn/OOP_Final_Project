// app.js
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
            
            // Add some sample products
            this.productManager.createProduct(
                "Cappuccino", 
                "Rich coffee with steamed milk", 
                45000, 
                ProductType.DRINK, 
                {size: "M", isHot: true}, 
                adminToken
            );
            
            this.productManager.createProduct(
                "Espresso", 
                "Strong black coffee", 
                35000, 
                ProductType.DRINK, 
                {size: "S", isHot: true}, 
                adminToken
            );
            
            this.productManager.createProduct(
                "Iced Latte", 
                "Smooth coffee with cold milk", 
                50000, 
                ProductType.DRINK, 
                {size: "L", isHot: false}, 
                adminToken
            );
            
            this.productManager.createProduct(
                "Croissant", 
                "Buttery pastry", 
                25000, 
                ProductType.FOOD, 
                {isVegetarian: false}, 
                adminToken
            );
            
            this.productManager.createProduct(
                "Veggie Sandwich", 
                "Fresh vegetables in whole grain bread", 
                35000, 
                ProductType.FOOD, 
                {isVegetarian: true}, 
                adminToken
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
                    <strong>Demo Accounts:</strong><br>
                    Admin: username "admin", password "admin123"<br>
                    Or register as a new customer
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

// Global UI functions that will be called from HTML
window.switchAuthTab = (tab) => app.uiManager.switchAuthTab(tab);
window.login = () => app.uiManager.login();
window.register = () => app.uiManager.register();
window.logout = () => app.uiManager.logout();
window.addToCart = (productId, quantity) => app.uiManager.addToCart(productId, quantity);
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

// Initialize application when page loads
window.addEventListener('DOMContentLoaded', () => {
    app.start();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.shutdown();
});

export default app;