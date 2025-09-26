// managers/UIManager.js
import { ProductType, OrderType, OrderStatus } from '../constants.js';
import { Admin } from '../classes/Admin.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentEditingProduct = null;
    }

    switchAuthTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const buttons = document.querySelectorAll('.tab-button');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            buttons[0].classList.add('active');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            buttons[1].classList.add('active');
        }
    }

    showAlert(message, type = 'error') {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const sessionToken = this.app.userManager.login(username, password);
            this.app.currentSession = sessionToken;
            
            const user = this.app.userManager.getCurrentUser(sessionToken);
            document.getElementById('userWelcome').textContent = `Welcome, ${user.username}!`;
            document.getElementById('userRole').textContent = user.role;
            document.getElementById('userRole').className = `status-badge status-${user.role.toLowerCase()}`;
            
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            
            if (user instanceof Admin) {
                document.getElementById('adminProductControls').classList.remove('hidden');
                document.getElementById('cartSection').classList.add('hidden');
            } else {
                document.getElementById('adminProductControls').classList.add('hidden');
                document.getElementById('cartSection').classList.remove('hidden');
            }
            
            this.loadProducts();
            this.loadCart();
            this.loadOrders();
            
            this.showAlert('Login successful!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    register() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const phoneNumber = document.getElementById('regPhone').value;
        const role = document.getElementById('regRole').value;
        
        try {
            this.app.userManager.registerUser(username, password, phoneNumber, role);
            this.showAlert('Registration successful! Please login.', 'success');
            this.switchAuthTab('login');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    logout() {
        if (this.app.currentSession) {
            this.app.userManager.logout(this.app.currentSession);
            this.app.currentSession = null;
        }
        
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        
        // Clear forms
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }

    loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const products = this.app.productManager.getAllProducts();
        const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
        
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const typeIcon = product.type === ProductType.DRINK ? '☕' : '🍴';
            const additionalInfo = product.type === ProductType.DRINK ? 
                `Size: ${product.size}, ${product.isHot ? 'Hot' : 'Cold'}` :
                `${product.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}`;
            
            productCard.innerHTML = `
                <h4>${typeIcon} ${product.name}</h4>
                <p>${product.description}</p>
                <p><small>${additionalInfo}</small></p>
                <div class="product-price">${this.formatPrice(product.price)}</div>
                <div>
                    ${!isAdmin ? `
                        <button class="btn" onclick="window.uiManager.addToCart('${product.id}', 1)">Add to Cart</button>
                    ` : `
                        <button class="btn" onclick="window.uiManager.editProduct('${product.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="window.uiManager.deleteProduct('${product.id}')">Delete</button>
                    `}
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
    }

    addToCart(productId, quantity) {
        try {
            this.app.cartManager.addToCart(productId, quantity, this.app.currentSession);
            this.loadCart();
            this.showAlert('Product added to cart!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    loadCart() {
        if (!this.app.currentSession || this.app.userManager.isAdmin(this.app.currentSession)) return;
        
        try {
            const cartItems = this.app.cartManager.getCart(this.app.currentSession);
            const cartContainer = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            cartContainer.innerHTML = '';
            let total = 0;
            
            cartItems.forEach(item => {
                const product = this.app.productManager.getProductById(item.productId);
                total += item.totalPrice;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div>
                        <h5>${product.name}</h5>
                        <p>Price: ${this.formatPrice(item.unitPrice)} each</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="window.uiManager.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.uiManager.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <span style="margin-left: 15px; font-weight: bold;">${this.formatPrice(item.totalPrice)}</span>
                    </div>
                `;
                cartContainer.appendChild(cartItem);
            });
            
            cartTotal.innerHTML = cartItems.length > 0 ? 
                `<h4>Total: ${this.formatPrice(total)}</h4>` : 
                '<p>Your cart is empty</p>';
            
            document.getElementById('checkoutBtn').style.display = cartItems.length > 0 ? 'block' : 'none';
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    updateCartQuantity(itemId, newQuantity) {
        try {
            this.app.cartManager.updateCartItemQuantity(itemId, newQuantity, this.app.currentSession);
            this.loadCart();
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    loadOrders() {
        try {
            const orders = this.app.orderManager.getAllOrders(this.app.currentSession);
            const ordersContainer = document.getElementById('ordersContainer');
            const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
            
            ordersContainer.innerHTML = '';
            
            if (orders.length === 0) {
                ordersContainer.innerHTML = '<p>No orders found</p>';
                return;
            }
            
            orders.sort((a, b) => b.createdAt - a.createdAt).forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-item';
                
                const statusClass = `status-${order.status.toLowerCase()}`;
                const orderTypeText = order.orderType === OrderType.REGULAR_ORDER ? 'Regular Delivery' : 'Express Pickup';
                const addressInfo = order.orderType === OrderType.REGULAR_ORDER ? 
                    `Address: ${order.deliveryAddress}` : 
                    `Pickup: ${order.pickupLocation}`;
                
                orderDiv.innerHTML = `
                    <div>
                        <h5>Order #${order.id.substr(-8)}</h5>
                        <p>${orderTypeText} - ${addressInfo}</p>
                        <p>Items: ${order.items.length} | Total: ${this.formatPrice(order.total)}</p>
                        <p>Created: ${order.createdAt.toLocaleString()}</p>
                        <p>Estimated time: ${order.getEstimatedPreparationTime()} minutes</p>
                    </div>
                    <div>
                        <span class="status-badge ${statusClass}">${order.status}</span>
                        ${isAdmin ? `
                            <select onchange="window.uiManager.updateOrderStatus('${order.id}', this.value)">
                                <option value="">Change Status</option>
                                <option value="${OrderStatus.CONFIRMED}">Confirmed</option>
                                <option value="${OrderStatus.PREPARING}">Preparing</option>
                                <option value="${OrderStatus.READY}">Ready</option>
                                <option value="${OrderStatus.DELIVERED}">Delivered</option>
                                <option value="${OrderStatus.CANCELLED}">Cancelled</option>
                            </select>
                        ` : ''}
                    </div>
                `;
                ordersContainer.appendChild(orderDiv);
            });
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    updateOrderStatus(orderId, newStatus) {
        if (!newStatus) return;
        
        try {
            this.app.orderManager.updateOrderStatus(orderId, newStatus, this.app.currentSession);
            this.loadOrders();
            this.showAlert('Order status updated!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    openProductModal(productId = null) {
        this.currentEditingProduct = productId;
        const modal = document.getElementById('productModal');
        
        if (productId) {
            const product = this.app.productManager.getProductById(productId);
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productType').value = product.type;
            
            if (product.type === ProductType.DRINK) {
                document.getElementById('productSize').value = product.size;
                document.getElementById('productIsHot').checked = product.isHot;
            } else {
                document.getElementById('productIsVegetarian').checked = product.isVegetarian;
            }
            
            this.toggleProductTypeFields();
        } else {
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productType').value = 'DRINK';
            this.toggleProductTypeFields();
        }
        
        modal.style.display = 'block';
    }

    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentEditingProduct = null;
    }

    toggleProductTypeFields() {
        const type = document.getElementById('productType').value;
        const drinkFields = document.getElementById('drinkFields');
        const foodFields = document.getElementById('foodFields');
        
        if (type === ProductType.DRINK) {
            drinkFields.classList.remove('hidden');
            foodFields.classList.add('hidden');
        } else {
            drinkFields.classList.add('hidden');
            foodFields.classList.remove('hidden');
        }
    }

    saveProduct() {
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const type = document.getElementById('productType').value;
        
        const specificData = {};
        if (type === ProductType.DRINK) {
            specificData.size = document.getElementById('productSize').value;
            specificData.isHot = document.getElementById('productIsHot').checked;
        } else {
            specificData.isVegetarian = document.getElementById('productIsVegetarian').checked;
        }
        
        try {
            if (this.currentEditingProduct) {
                const updates = { name, description, price };
                this.app.productManager.updateProduct(this.currentEditingProduct, updates, this.app.currentSession);
                this.showAlert('Product updated successfully!', 'success');
            } else {
                this.app.productManager.createProduct(name, description, price, type, specificData, this.app.currentSession);
                this.showAlert('Product created successfully!', 'success');
            }
            
            this.closeProductModal();
            this.loadProducts();
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                this.app.productManager.deleteProduct(productId, this.app.currentSession);
                this.loadProducts();
                this.showAlert('Product deleted successfully!', 'success');
            } catch (error) {
                this.showAlert(error.message);
            }
        }
    }

    openCheckoutModal() {
        document.getElementById('checkoutModal').style.display = 'block';
        this.toggleOrderFields();
    }

    closeCheckoutModal() {
        document.getElementById('checkoutModal').style.display = 'none';
    }

    toggleOrderFields() {
        const orderType = document.getElementById('orderType').value;
        const regularFields = document.getElementById('regularOrderFields');
        const expressFields = document.getElementById('expressOrderFields');
        
        if (orderType === OrderType.REGULAR_ORDER) {
            regularFields.classList.remove('hidden');
            expressFields.classList.add('hidden');
        } else {
            regularFields.classList.add('hidden');
            expressFields.classList.remove('hidden');
        }
    }

    placeOrder() {
        const orderType = document.getElementById('orderType').value;
        const orderData = {};
        
        if (orderType === OrderType.REGULAR_ORDER) {
            orderData.deliveryAddress = document.getElementById('deliveryAddress').value;
            if (!orderData.deliveryAddress) {
                this.showAlert('Delivery address is required');
                return;
            }
        } else {
            orderData.pickupLocation = document.getElementById('pickupLocation').value;
            if (!orderData.pickupLocation) {
                this.showAlert('Pickup location is required');
                return;
            }
        }
        
        try {
            const order = this.app.orderManager.createOrder(orderType, orderData, this.app.currentSession);
            this.closeCheckoutModal();
            this.loadCart();
            this.loadOrders();
            this.showAlert(`Order placed successfully! Order ID: #${order.id.substr(-8)}`, 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    setupEventListeners() {
        // Close modals when clicking outside
        window.onclick = (event) => {
            const productModal = document.getElementById('productModal');
            const checkoutModal = document.getElementById('checkoutModal');
            
            if (event.target === productModal) {
                this.closeProductModal();
            }
            if (event.target === checkoutModal) {
                this.closeCheckoutModal();
            }
        }
    }
}