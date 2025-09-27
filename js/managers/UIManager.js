// managers/UIManager.js - Enhanced version with image support
import { ProductType, OrderType, OrderStatus, SizeMultipliers } from '../constants.js';
import { Admin } from '../classes/Admin.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentEditingProduct = null;
        this.currentFilter = 'ALL'; // Track current filter
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
        // REMOVED: const role = document.getElementById('regRole').value;
        const role = 'CUSTOMER'; // DEFAULT: Always create as customer
        
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
            // REMOVED: document.getElementById('regRole').value = 'CUSTOMER';
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
        
        // Reset filter
        this.currentFilter = 'ALL';
        
        this.showAlert('You have been logged out successfully', 'success');
    }

    // New filter function
    filterProducts(type) {
        this.currentFilter = type;
        this.loadProducts();
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.filter-btn[data-type="${type}"]`).classList.add('active');
    }

    loadProducts() {
        console.log('Loading products...');
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }
        
        try {
            let products = this.app.productManager.getAllProducts();
            
            // Apply filter
            if (this.currentFilter !== 'ALL') {
                products = products.filter(product => product.type === this.currentFilter);
            }
            
            console.log('Found products:', products.length);
            
            const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
            
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                const filterText = this.currentFilter === 'ALL' ? 'products' : 
                    (this.currentFilter === ProductType.DRINK ? 'drinks' : 'food items');
                productsGrid.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-${this.currentFilter === ProductType.DRINK ? 'coffee' : 'utensils'}" 
                        style="font-size: 3em; color: #8b4513; margin-bottom: 20px;"></i>
                        <h3>No ${filterText} available</h3>
                        <p>Check back soon for our amazing ${filterText}!</p>
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

                // Size selector for drinks (customer view only)
                const sizeSelector = (!isAdmin && product.type === ProductType.DRINK) ? `
                    <div class="product-size-selector">
                        <label><i class="fas fa-expand-arrows-alt"></i> Size:</label>
                        <div class="size-options">
                            ${Object.entries(SizeMultipliers).map(([size, info]) => `
                                <input type="radio" name="size_${product.id}" value="${size}" 
                                    id="size_${product.id}_${size}" ${size === 'M' ? 'checked' : ''}>
                                <label for="size_${product.id}_${size}" class="size-option-label">
                                    ${size} <span class="size-price">${this.formatPrice(product.price * info.multiplier)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                ` : '';
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.imageUrl || product.imageURL}" alt="${product.name}" 
                            onerror="this.src='https://via.placeholder.com/300x200/8B4513/FFFFFF?text=${encodeURIComponent(product.name)}'">
                        <div class="product-type-badge">${typeIcon}</div>
                    </div>
                    <div class="product-content">
                        <div class="product-header">
                            <h4>${product.name}</h4>
                        </div>
                        <p class="product-description">${product.description}</p>
                        ${additionalInfo}
                        <div class="product-price-base">Price: ${this.formatPrice(product.price)}</div>
                        ${sizeSelector}
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
                                <button class="btn btn-add-to-cart" onclick="window.uiManager.addToCartWithSize('${product.id}')">
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

    addToCart(productId, quantity, size = 'M') {
        if (!quantity || quantity < 1) {
            this.showAlert('Please select a valid quantity');
            return;
        }
        
        try {
            this.app.cartManager.addToCart(productId, quantity, this.app.currentSession, size);
            this.loadCart();
            this.showAlert(`Added ${quantity} item(s) to your cart!`, 'success');
            
            // Reset quantity input
            const qtyInput = document.getElementById(`qty_${productId}`);
            if (qtyInput) qtyInput.value = '1';
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    addToCartWithSize(productId) {
        const quantity = parseInt(document.getElementById(`qty_${productId}`).value || 1);
        
        if (!quantity || quantity < 1) {
            this.showAlert('Please select a valid quantity');
            return;
        }
        
        // Get selected size for drinks
        const product = this.app.productManager.getProductById(productId);
        let selectedSize = 'M'; // default
        
        if (product && product.type === ProductType.DRINK) {
            const sizeRadios = document.querySelectorAll(`input[name="size_${productId}"]`);
            for (let radio of sizeRadios) {
                if (radio.checked) {
                    selectedSize = radio.value;
                    break;
                }
            }
        }
        
        try {
            this.app.cartManager.addToCart(productId, quantity, this.app.currentSession, selectedSize);
            this.loadCart();
            
            const sizeText = product.type === ProductType.DRINK ? ` (Size: ${selectedSize})` : '';
            this.showAlert(`Added ${quantity} item(s)${sizeText} to your cart!`, 'success');
            
            // Reset quantity input
            const qtyInput = document.getElementById(`qty_${productId}`);
            if (qtyInput) qtyInput.value = '1';
            
            // Reset size selection to Medium
            const mediumRadio = document.getElementById(`size_${productId}_M`);
            if (mediumRadio) mediumRadio.checked = true;
            
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
                
                // Size info for drinks
                const sizeInfo = product.type === ProductType.DRINK ? 
                    `<span class="item-size">Size: ${item.size} (${SizeMultipliers[item.size]?.label || 'Medium'})</span>` : '';
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${product.imageUrl || product.imageURL}" alt="${product.name}" 
                            onerror="this.src='https://via.placeholder.com/60x60/8B4513/FFFFFF?text=${encodeURIComponent(product.name.charAt(0))}'">
                    </div>
                    <div class="cart-item-info">
                        <h5>${product.name}</h5>
                        ${sizeInfo}
                        <p class="item-price">
                            <i class="fas fa-tag"></i> ${this.formatPrice(item.getUnitPriceWithSize())} each
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
                document.getElementById('productImageUrl').value = product.imageUrl || product.imageURL || '';
                
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
            document.getElementById('productImageUrl').value = '';
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
        const imageUrl = document.getElementById('productImageUrl').value;
        
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
                if (imageUrl) updates.imageUrl = imageUrl;
                this.app.productManager.updateProduct(this.currentEditingProduct, updates, this.app.currentSession);
                this.showAlert('Product updated successfully!', 'success');
            } else {
                this.app.productManager.createProduct(name, description, price, type, specificData, this.app.currentSession, imageUrl);
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

    loadCheckoutCartItems() {
    if (!this.app.currentSession || this.app.userManager.isAdmin(this.app.currentSession)) return;
    
    try {
        const cartItems = this.app.cartManager.getCart(this.app.currentSession);
        const checkoutCartItems = document.getElementById('checkoutCartItems');
        
        if (!checkoutCartItems) return;
        
        checkoutCartItems.innerHTML = '';
        
        if (cartItems.length === 0) {
            checkoutCartItems.innerHTML = '<p style="text-align: center; color: #666;">No items in cart</p>';
            return;
        }
        
        cartItems.forEach(item => {
            const product = this.app.productManager.getProductById(item.productId);
            if (!product) return;
            
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            
            // Size selector for drinks only
            const sizeSelector = product.type === ProductType.DRINK ? `
                <div class="size-selector">
                    ${Object.entries(SizeMultipliers).map(([size, info]) => `
                        <button class="size-option ${item.size === size ? 'active' : ''}" 
                                onclick="window.uiManager.updateCheckoutItemSize('${item.id}', '${size}')">
                            ${size}
                        </button>
                    `).join('')}
                </div>
                <div class="size-info">
                    S: -20% | M: Normal | L: +30%
                </div>
            ` : '';
            
            checkoutItem.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${product.imageUrl || product.imageURL}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/50x50/8B4513/FFFFFF?text=${encodeURIComponent(product.name.charAt(0))}'">
                </div>
                <div class="checkout-item-info">
                    <h6>${product.name}</h6>
                    <p class="checkout-item-qty">Quantity: ${item.quantity}</p>
                </div>
                <div class="checkout-item-controls">
                    ${sizeSelector}
                    <div class="checkout-item-price">
                        ${this.formatPrice(item.totalPrice)}
                    </div>
                </div>
            `;
            
            checkoutCartItems.appendChild(checkoutItem);
        });
        
    } catch (error) {
        console.error('Error loading checkout cart items:', error);
    }
    }

    updateCheckoutItemSize(itemId, newSize) {
    try {
        this.app.cartManager.updateCartItemSize(itemId, newSize, this.app.currentSession);
        this.loadCheckoutCartItems(); // Reload checkout items
        this.loadCart(); // Reload main cart display
    } catch (error) {
        this.showAlert(error.message);
    }
    }

    openCheckoutModal() {
        document.getElementById('checkoutModal').style.display = 'block';
        document.getElementById('orderType').value = 'REGULAR_ORDER';
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('pickupLocation').value = '';
        this.toggleOrderFields();
        this.loadCheckoutCartItems(); 
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

    updateCheckoutItemSize(itemId, newSize) {
        try {
            this.app.cartManager.updateCartItemSize(itemId, newSize, this.app.currentSession);
            this.loadCheckoutCartItems(); // Reload checkout items
            this.loadCart(); // Reload main cart display
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    // Method 4: REPLACE placeOrder method
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
            
            const orderTypeText = orderType === OrderType.REGULAR_ORDER ? 'regular' : 'express';
            const deliveryFee = orderType === OrderType.REGULAR_ORDER ? '25,000' : '50,000';
            this.showAlert(`Order placed successfully! Your ${orderTypeText} order #${order.id.substr(-8)} will be ready in ~${order.getEstimatedPreparationTime()} minutes. Delivery fee: ${deliveryFee} VND`, 'success');
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