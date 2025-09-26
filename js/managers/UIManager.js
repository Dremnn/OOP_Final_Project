// managers/UIManager.js - Fixed version
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
        alert.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i> ${message}`;
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showAlert('Please fill in all fields');
            return;
        }
        
        try {
            const sessionToken = this.app.userManager.login(username, password);
            this.app.currentSession = sessionToken;
            
            const user = this.app.userManager.getCurrentUser(sessionToken);
            document.getElementById('userWelcome').textContent = `Welcome back, ${user.username}!`;
            document.getElementById('userRole').textContent = user.role === 'ADMIN' ? 'Store Manager' : 'Coffee Lover';
            document.getElementById('userRole').className = `role-badge status-${user.role.toLowerCase()}`;
            
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            
            if (user instanceof Admin) {
                document.getElementById('adminProductControls').classList.remove('hidden');
                document.getElementById('cartSection').classList.add('hidden');
            } else {
                document.getElementById('adminProductControls').classList.add('hidden');
                document.getElementById('cartSection').classList.remove('hidden');
            }
            
            // Load data with delay to ensure DOM is ready
            setTimeout(() => {
                this.loadProducts();
                this.loadCart();
                this.loadOrders();
            }, 100);
            
            this.showAlert('Welcome to Highlands Coffee!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    register() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const phoneNumber = document.getElementById('regPhone').value;
        const role = document.getElementById('regRole').value;
        
        if (!username || !password || !phoneNumber) {
            this.showAlert('Please fill in all fields');
            return;
        }
        
        try {
            this.app.userManager.registerUser(username, password, phoneNumber, role);
            this.showAlert('Registration successful! Please login to continue.', 'success');
            this.switchAuthTab('login');
            
            // Clear registration form
            document.getElementById('regUsername').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regPhone').value = '';
            document.getElementById('regRole').value = 'CUSTOMER';
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
        
        this.showAlert('You have been logged out successfully', 'success');
    }

    loadProducts() {
        console.log('Loading products...');
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }
        
        try {
            const products = this.app.productManager.getAllProducts();
            console.log('Found products:', products.length);
            
            const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
            
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-coffee" style="font-size: 3em; color: #8b4513; margin-bottom: 20px;"></i>
                        <h3>No products available</h3>
                        <p>Check back soon for our amazing coffee selection!</p>
                    </div>
                `;
                return;
            }
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // Get product type icon and info
                const typeIcon = product.type === ProductType.DRINK ? '☕' : '🍽️';
                const typeClass = product.type === ProductType.DRINK ? 'drink-card' : 'food-card';
                
                let additionalInfo = '';
                if (product.type === ProductType.DRINK) {
                    additionalInfo = `
                        <div class="product-specs">
                            <span class="spec-badge"><i class="fas fa-expand-arrows-alt"></i> ${product.size}</span>
                            <span class="spec-badge ${product.isHot ? 'hot' : 'cold'}">
                                <i class="fas fa-${product.isHot ? 'fire' : 'snowflake'}"></i> 
                                ${product.isHot ? 'Hot' : 'Cold'}
                            </span>
                        </div>
                    `;
                } else {
                    additionalInfo = `
                        <div class="product-specs">
                            <span class="spec-badge ${product.isVegetarian ? 'vegetarian' : 'non-vegetarian'}">
                                <i class="fas fa-${product.isVegetarian ? 'leaf' : 'drumstick-bite'}"></i> 
                                ${product.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                            </span>
                        </div>
                    `;
                }
                
                productCard.innerHTML = `
                    <div class="product-header">
                        <div class="product-type-icon">${typeIcon}</div>
                        <h4>${product.name}</h4>
                    </div>
                    <p class="product-description">${product.description}</p>
                    ${additionalInfo}
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                    <div class="product-actions">
                        ${!isAdmin ? `
                            <div class="quantity-selector">
                                <button class="quantity-btn" onclick="this.nextElementSibling.value = Math.max(1, parseInt(this.nextElementSibling.value || 1) - 1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" value="1" min="1" max="10" class="quantity-input" id="qty_${product.id}">
                                <button class="quantity-btn" onclick="this.previousElementSibling.value = Math.min(10, parseInt(this.previousElementSibling.value || 1) + 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-add-to-cart" onclick="window.uiManager.addToCart('${product.id}', parseInt(document.getElementById('qty_${product.id}').value || 1))">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        ` : `
                            <div class="admin-actions">
                                <button class="btn btn-edit" onclick="window.uiManager.editProduct('${product.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger btn-delete" onclick="window.uiManager.deleteProduct('${product.id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        `}
                    </div>
                `;
                
                productCard.classList.add(typeClass);
                productsGrid.appendChild(productCard);
            });
            
            console.log('Products loaded successfully');
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Error loading products: ' + error.message);
        }
    }

    addToCart(productId, quantity) {
        if (!quantity || quantity < 1) {
            this.showAlert('Please select a valid quantity');
            return;
        }
        
        try {
            this.app.cartManager.addToCart(productId, quantity, this.app.currentSession);
            this.loadCart();
            this.showAlert(`Added ${quantity} item(s) to your cart!`, 'success');
            
            // Reset quantity input
            const qtyInput = document.getElementById(`qty_${productId}`);
            if (qtyInput) qtyInput.value = '1';
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
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (!cartContainer || !cartTotal || !checkoutBtn) return;
            
            cartContainer.innerHTML = '';
            let total = 0;
            
            if (cartItems.length === 0) {
                cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart" style="font-size: 3em; color: #8b4513; margin-bottom: 15px;"></i>
                        <h4>Your cart is empty</h4>
                        <p>Add some delicious items from our menu!</p>
                    </div>
                `;
                cartTotal.innerHTML = '';
                checkoutBtn.classList.add('hidden');
                return;
            }
            
            cartItems.forEach(item => {
                const product = this.app.productManager.getProductById(item.productId);
                if (!product) return;
                
                total += item.totalPrice;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h5>${product.name}</h5>
                        <p class="item-price">
                            <i class="fas fa-tag"></i> ${this.formatPrice(item.unitPrice)} each
                        </p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="window.uiManager.updateCartQuantity('${item.id}', ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="window.uiManager.updateCartQuantity('${item.id}', ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-total">
                            ${this.formatPrice(item.totalPrice)}
                        </div>
                    </div>
                `;
                cartContainer.appendChild(cartItem);
            });
            
            cartTotal.innerHTML = `
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${this.formatPrice(total)}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span><strong>Total:</strong></span>
                        <span><strong>${this.formatPrice(total)}</strong></span>
                    </div>
                </div>
            `;
            
            checkoutBtn.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading cart:', error);
            this.showAlert('Error loading cart: ' + error.message);
        }
    }

    updateCartQuantity(itemId, newQuantity) {
        try {
            this.app.cartManager.updateCartItemQuantity(itemId, newQuantity, this.app.currentSession);
            this.loadCart();
            
            if (newQuantity <= 0) {
                this.showAlert('Item removed from cart', 'success');
            }
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    loadOrders() {
        try {
            const orders = this.app.orderManager.getAllOrders(this.app.currentSession);
            const ordersContainer = document.getElementById('ordersContainer');
            const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
            
            if (!ordersContainer) return;
            
            ordersContainer.innerHTML = '';
            
            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-receipt" style="font-size: 3em; color: #8b4513; margin-bottom: 15px;"></i>
                        <h4>No orders yet</h4>
                        <p>${isAdmin ? 'No customer orders to display' : 'Start by adding items to your cart!'}</p>
                    </div>
                `;
                return;
            }
            
            orders.sort((a, b) => b.createdAt - a.createdAt).forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-item';
                
                const statusClass = `status-${order.status.toLowerCase()}`;
                const orderTypeText = order.orderType === OrderType.REGULAR_ORDER ? 'Home Delivery' : 'Store Pickup';
                const addressInfo = order.orderType === OrderType.REGULAR_ORDER ? 
                    `<i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}` : 
                    `<i class="fas fa-store"></i> ${order.pickupLocation}`;
                
                orderDiv.innerHTML = `
                    <div class="order-info">
                        <div class="order-header">
                            <h5><i class="fas fa-receipt"></i> Order #${order.id.substr(-8)}</h5>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            <p class="order-type">
                                <i class="fas fa-${order.orderType === OrderType.REGULAR_ORDER ? 'truck' : 'store'}"></i>
                                ${orderTypeText}
                            </p>
                            <p class="order-address">${addressInfo}</p>
                            <div class="order-meta">
                                <span><i class="fas fa-box"></i> ${order.items.length} items</span>
                                <span><i class="fas fa-clock"></i> ~${order.getEstimatedPreparationTime()} mins</span>
                                <span class="order-total"><i class="fas fa-dollar-sign"></i> ${this.formatPrice(order.total)}</span>
                            </div>
                            <p class="order-date">
                                <i class="fas fa-calendar"></i> ${order.createdAt.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    ${isAdmin ? `
                        <div class="order-actions">
                            <select class="status-select" onchange="window.uiManager.updateOrderStatus('${order.id}', this.value)">
                                <option value="">Change Status</option>
                                <option value="${OrderStatus.CONFIRMED}">Confirmed</option>
                                <option value="${OrderStatus.PREPARING}">Preparing</option>
                                <option value="${OrderStatus.READY}">Ready</option>
                                <option value="${OrderStatus.DELIVERED}">Delivered</option>
                                <option value="${OrderStatus.CANCELLED}">Cancelled</option>
                            </select>
                        </div>
                    ` : ''}
                `;
                ordersContainer.appendChild(orderDiv);
            });
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showAlert('Error loading orders: ' + error.message);
        }
    }

    updateOrderStatus(orderId, newStatus) {
        if (!newStatus) return;
        
        try {
            this.app.orderManager.updateOrderStatus(orderId, newStatus, this.app.currentSession);
            this.loadOrders();
            this.showAlert('Order status updated successfully!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    openProductModal(productId = null) {
        this.currentEditingProduct = productId;
        const modal = document.getElementById('productModal');
        
        if (productId) {
            const product = this.app.productManager.getProductById(productId);
            if (product) {
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
            }
        } else {
            // Clear form for new product
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productType').value = 'DRINK';
            document.getElementById('productSize').value = 'M';
            document.getElementById('productIsHot').checked = false;
            document.getElementById('productIsVegetarian').checked = false;
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
        
        if (!name || !description || !price || price <= 0) {
            this.showAlert('Please fill in all required fields with valid values');
            return;
        }
        
        const specificData = {};
        if (type === ProductType.DRINK) {
            specificData.size = document.getElementById('productSize').value;
            specificData.isHot = document.getElementById('productIsHot').checked;
        } else {
            specificData.isVegetarian = document.getElementById('productIsVegetarian').checked;
        }
        
        try {
            if (this.currentEditingProduct) {
                const updates = { name, description, price, ...specificData };
                this.app.productManager.updateProduct(this.currentEditingProduct, updates, this.app.currentSession);
                this.showAlert('Product updated successfully!', 'success');
            } else {
                // For new products, we need to provide imageUrl (using placeholder for now)
                const imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`;
                this.app.productManager.createProduct(name, description, price, imageUrl, type, specificData, this.app.currentSession);
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
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
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
        document.getElementById('orderType').value = 'REGULAR_ORDER';
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('pickupLocation').value = '';
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
            if (!orderData.deliveryAddress.trim()) {
                this.showAlert('Please enter a delivery address');
                return;
            }
        } else {
            orderData.pickupLocation = document.getElementById('pickupLocation').value;
            if (!orderData.pickupLocation.trim()) {
                this.showAlert('Please enter a pickup location');
                return;
            }
        }
        
        try {
            const order = this.app.orderManager.createOrder(orderType, orderData, this.app.currentSession);
            this.closeCheckoutModal();
            this.loadCart();
            this.loadOrders();
            
            const orderTypeText = orderType === OrderType.REGULAR_ORDER ? 'delivery' : 'pickup';
            this.showAlert(`Order placed successfully! Your ${orderTypeText} order #${order.id.substr(-8)} will be ready in ~${order.getEstimatedPreparationTime()} minutes.`, 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
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
        
        // Handle ESC key to close modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeProductModal();
                this.closeCheckoutModal();
            }
        });
    }
}