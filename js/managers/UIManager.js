// managers/UIManager.js - Optimized version
import { ProductType, OrderType, OrderStatus, SizeMultipliers } from '../constants.js';
import { Admin } from '../classes/Admin.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentEditingProduct = null;
        this.currentFilter = 'ALL';
        
        // Cache frequently used DOM elements
        this.elements = {
            authSection: null,
            mainApp: null,
            productsGrid: null,
            cartItems: null,
            cartTotal: null,
            checkoutBtn: null,
            ordersContainer: null,
            alertContainer: null
        };
    }

    // Cache DOM elements on first access
    getElement(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }

    switchAuthTab(tab) {
        const loginForm = this.getElement('loginForm');
        const registerForm = this.getElement('registerForm');
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
        const alertContainer = this.getElement('alertContainer');
        const alert = document.createElement('div');
        const iconClass = type === 'error' ? 'exclamation-triangle' : 'check-circle';
        
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<i class="fas fa-${iconClass}"></i> ${message}`;
        alertContainer.appendChild(alert);
        
        setTimeout(() => alert.remove(), 5000);
    }

    login() {
        const username = this.getElement('loginUsername').value;
        const password = this.getElement('loginPassword').value;
        
        if (!username || !password) {
            this.showAlert('Please fill in all fields');
            return;
        }
        
        try {
            const sessionToken = this.app.userManager.login(username, password);
            this.app.currentSession = sessionToken;
            
            const user = this.app.userManager.getCurrentUser(sessionToken);
            this.getElement('userWelcome').textContent = `Welcome back, ${user.username}!`;
            this.getElement('userRole').textContent = user.role === 'ADMIN' ? 'Store Manager' : 'Coffee Lover';
            this.getElement('userRole').className = `role-badge status-${user.role.toLowerCase()}`;
            
            this.getElement('authSection').classList.add('hidden');
            this.getElement('mainApp').classList.remove('hidden');
            
            const isAdmin = user instanceof Admin;
            this.getElement('adminProductControls').classList.toggle('hidden', !isAdmin);
            this.getElement('cartSection').classList.toggle('hidden', isAdmin);
            
            // Load data after UI updates
            setTimeout(() => {
                this.loadProducts();
                if (!isAdmin) this.loadCart();
                this.loadOrders();
            }, 100);
            
            this.showAlert('Welcome to Highlands Coffee!', 'success');
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    register() {
        const username = this.getElement('regUsername').value;
        const password = this.getElement('regPassword').value;
        const phoneNumber = this.getElement('regPhone').value;
        
        if (!username || !password || !phoneNumber) {
            this.showAlert('Please fill in all fields');
            return;
        }
        
        try {
            this.app.userManager.registerUser(username, password, phoneNumber, 'CUSTOMER');
            this.showAlert('Registration successful! Please login to continue.', 'success');
            this.switchAuthTab('login');
            
            // Clear form
            ['regUsername', 'regPassword', 'regPhone'].forEach(id => {
                this.getElement(id).value = '';
            });
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    logout() {
        if (this.app.currentSession) {
            this.app.userManager.logout(this.app.currentSession);
            this.app.currentSession = null;
        }
        
        this.getElement('authSection').classList.remove('hidden');
        this.getElement('mainApp').classList.add('hidden');
        
        // Clear forms and reset filter
        ['loginUsername', 'loginPassword'].forEach(id => {
            this.getElement(id).value = '';
        });
        this.currentFilter = 'ALL';
        
        this.showAlert('You have been logged out successfully', 'success');
    }

    filterProducts(type) {
        this.currentFilter = type;
        this.loadProducts();
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filter-btn[data-type="${type}"]`).classList.add('active');
    }

    loadProducts() {
        const productsGrid = this.getElement('productsGrid');
        if (!productsGrid) return;
        
        try {
            let products = this.app.productManager.getAllProducts();
            
            // Apply filter
            if (this.currentFilter !== 'ALL') {
                products = products.filter(product => product.type === this.currentFilter);
            }
            
            const isAdmin = this.app.userManager.isAdmin(this.app.currentSession);
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                const filterText = this.currentFilter === 'ALL' ? 'products' : 
                    (this.currentFilter === ProductType.DRINK ? 'drinks' : 'food items');
                const icon = this.currentFilter === ProductType.DRINK ? 'coffee' : 'utensils';
                
                productsGrid.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-${icon}" style="font-size: 3em; color: #8b4513; margin-bottom: 20px;"></i>
                        <h3>No ${filterText} available</h3>
                        <p>Check back soon for our amazing ${filterText}!</p>
                    </div>
                `;
                return;
            }
            
            products.forEach(product => {
                const productCard = this.createProductCard(product, isAdmin);
                productsGrid.appendChild(productCard);
            });
            
        } catch (error) {
            this.showAlert('Error loading products: ' + error.message);
        }
    }

    createProductCard(product, isAdmin) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const typeIcon = product.type === ProductType.DRINK ? '☕' : '🍽️';
        const typeClass = product.type === ProductType.DRINK ? 'drink-card' : 'food-card';
        
        // Product specs
        let specs = '';
        if (product.type === ProductType.DRINK) {
            const tempClass = product.isHot ? 'hot' : 'cold';
            const tempIcon = product.isHot ? 'fire' : 'snowflake';
            const tempText = product.isHot ? 'Hot' : 'Cold';
            specs = `<span class="spec-badge ${tempClass}"><i class="fas fa-${tempIcon}"></i> ${tempText}</span>`;
        } else {
            const vegClass = product.isVegetarian ? 'vegetarian' : 'non-vegetarian';
            const vegIcon = product.isVegetarian ? 'leaf' : 'drumstick-bite';
            const vegText = product.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian';
            specs = `<span class="spec-badge ${vegClass}"><i class="fas fa-${vegIcon}"></i> ${vegText}</span>`;
        }

        // Size selector for drinks (customer view only)
        const sizeSelector = (!isAdmin && product.type === ProductType.DRINK) ? 
            this.createSizeSelector(product) : '';
        
        // Actions based on user type
        const actions = isAdmin ? `
            <div class="admin-actions">
                <button class="btn btn-edit" onclick="window.uiManager.editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-delete" onclick="window.uiManager.deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        ` : `
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
        `;
        
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
                <div class="product-specs">${specs}</div>
                <div class="product-price-display" id="price_display_${product.id}">
                    Price: ${this.formatPrice(product.price)}
                </div>
                ${sizeSelector}
                <div class="product-actions">${actions}</div>
            </div>
        `;
        
        productCard.classList.add(typeClass);
        return productCard;
    }

    createSizeSelector(product) {
        const sizeOptions = Object.entries(SizeMultipliers).map(([size, info]) => `
            <button type="button" class="size-option-btn ${size === 'M' ? 'active' : ''}" 
                onclick="window.uiManager.selectSize('${product.id}', '${size}', ${product.price * info.multiplier})">
                ${size} - ${this.formatPrice(product.price * info.multiplier)}
            </button>
        `).join('');

        return `
            <div class="product-size-compact">
                <div class="current-size-display">
                    <span class="size-label">Size: <strong id="current_size_${product.id}">M</strong></span>
                    <span class="size-price" id="current_price_${product.id}">${this.formatPrice(product.price)}</span>
                </div>
                <button type="button" class="size-change-btn" onclick="window.uiManager.toggleSizeSelector('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <div class="size-options-popup hidden" id="size_popup_${product.id}">
                    ${sizeOptions}
                </div>
            </div>
        `;
    }

    // Unified add to cart method
    addToCartWithSize(productId) {
        const qtyInput = this.getElement(`qty_${productId}`);
        const quantity = parseInt(qtyInput?.value || 1);
        
        if (quantity < 1) {
            this.showAlert('Please select a valid quantity');
            return;
        }
        
        const product = this.app.productManager.getProductById(productId);
        if (!product) return;
        
        // Get selected size for drinks
        let selectedSize = 'M';
        if (product.type === ProductType.DRINK) {
            const currentSizeElement = this.getElement(`current_size_${productId}`);
            if (currentSizeElement) {
                selectedSize = currentSizeElement.textContent.trim();
            }
        }
        
        try {
            this.app.cartManager.addToCart(productId, quantity, this.app.currentSession, selectedSize);
            this.loadCart();
            
            const sizeText = product.type === ProductType.DRINK ? ` (Size: ${selectedSize})` : '';
            this.showAlert(`Added ${quantity} item(s)${sizeText} to your cart!`, 'success');
            
            // Reset inputs
            if (qtyInput) qtyInput.value = '1';
            if (product.type === ProductType.DRINK) {
                this.selectSize(productId, 'M', product.price);
            }
            
        } catch (error) {
            this.showAlert(error.message);
        }
    }

    toggleSizeSelector(productId) {
        const popup = this.getElement(`size_popup_${productId}`);
        if (!popup) return;
        
        // Close other popups
        document.querySelectorAll('.size-options-popup').forEach(p => {
            if (p.id !== `size_popup_${productId}`) {
                p.classList.add('hidden');
            }
        });
        
        // Toggle current popup
        popup.classList.toggle('hidden');
        
        // Setup outside click handler
        if (!popup.classList.contains('hidden')) {
            setTimeout(() => {
                const closeHandler = (e) => {
                    if (!e.target.closest(`#size_popup_${productId}`) && 
                        !e.target.closest('.size-change-btn')) {
                        popup.classList.add('hidden');
                        document.removeEventListener('click', closeHandler);
                    }
                };
                document.addEventListener('click', closeHandler);
            }, 10);
        }
    }

    selectSize(productId, size, price) {
        // Update displays
        const currentSizeElement = this.getElement(`current_size_${productId}`);
        const priceDisplayElement = this.getElement(`price_display_${productId}`);
        const popup = this.getElement(`size_popup_${productId}`);
        
        if (currentSizeElement) currentSizeElement.textContent = size;
        if (priceDisplayElement) priceDisplayElement.textContent = `Price: ${this.formatPrice(price)}`;
        
        // Update button states
        if (popup) {
            popup.querySelectorAll('.size-option-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = popup.querySelector(`[onclick*="'${size}'"]`);
            if (activeBtn) activeBtn.classList.add('active');
            popup.classList.add('hidden');
        }
    }

    loadCart() {
        if (!this.app.currentSession || this.app.userManager.isAdmin(this.app.currentSession)) return;
        
        try {
            const cartItems = this.app.cartManager.getCart(this.app.currentSession);
            const cartContainer = this.getElement('cartItems');
            const cartTotal = this.getElement('cartTotal');
            const checkoutBtn = this.getElement('checkoutBtn');
            
            if (!cartContainer) return;
            
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
                if (cartTotal) cartTotal.innerHTML = '';
                if (checkoutBtn) checkoutBtn.classList.add('hidden');
                return;
            }
            
            cartItems.forEach(item => {
                const product = this.app.productManager.getProductById(item.productId);
                if (!product) return;
                
                total += item.totalPrice;
                
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
                        <div class="item-total">${this.formatPrice(item.totalPrice)}</div>
                    </div>
                `;
                cartContainer.appendChild(cartItem);
            });
            
            if (cartTotal) {
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
            }
            
            if (checkoutBtn) checkoutBtn.classList.remove('hidden');
            
        } catch (error) {
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
            const ordersContainer = this.getElement('ordersContainer');
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
                const addressInfo = `<i class="fas fa-map-marker-alt"></i> ${order.deliveryAddress}`;
                
                const statusSelect = isAdmin ? `
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
                ` : '';
                
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
                    ${statusSelect}
                `;
                ordersContainer.appendChild(orderDiv);
            });
        } catch (error) {
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

    // Product Management Methods
    openProductModal(productId = null) {
        this.currentEditingProduct = productId;
        const modal = this.getElement('productModal');
        
        if (productId) {
            const product = this.app.productManager.getProductById(productId);
            if (product) {
                this.populateProductForm(product);
            }
        } else {
            this.clearProductForm();
        }
        
        modal.style.display = 'block';
    }

    populateProductForm(product) {
        const fields = ['productName', 'productPrice', 'productType', 'productImageUrl'];
        const values = [product.name, product.price, product.type, product.imageUrl || product.imageURL || ''];
        
        fields.forEach((field, index) => {
            const element = this.getElement(field);
            if (element) element.value = values[index];
        });
        
        if (product.type === ProductType.DRINK) {
            const sizeEl = this.getElement('productSize');
            const hotEl = this.getElement('productIsHot');
            if (sizeEl) sizeEl.value = product.size;
            if (hotEl) hotEl.checked = product.isHot;
        } else {
            const vegEl = this.getElement('productIsVegetarian');
            if (vegEl) vegEl.checked = product.isVegetarian;
        }
        
        this.toggleProductTypeFields();
    }

    clearProductForm() {
        const fieldDefaults = {
            'productName': '',
            'productPrice': '',
            'productType': 'DRINK',
            'productImageUrl': '',
            'productSize': 'M',
            'productIsHot': false,
            'productIsVegetarian': false
        };
        
        Object.entries(fieldDefaults).forEach(([field, defaultValue]) => {
            const element = this.getElement(field);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = defaultValue;
                } else {
                    element.value = defaultValue;
                }
            }
        });
        
        this.toggleProductTypeFields();
    }

    closeProductModal() {
        this.getElement('productModal').style.display = 'none';
        this.currentEditingProduct = null;
    }

    toggleProductTypeFields() {
        const type = this.getElement('productType').value;
        const drinkFields = this.getElement('drinkFields');
        const foodFields = this.getElement('foodFields');
        
        if (type === ProductType.DRINK) {
            drinkFields?.classList.remove('hidden');
            foodFields?.classList.add('hidden');
        } else {
            drinkFields?.classList.add('hidden');
            foodFields?.classList.remove('hidden');
        }
    }

    saveProduct() {
        const name = this.getElement('productName').value;
        const price = parseFloat(this.getElement('productPrice').value);
        const type = this.getElement('productType').value;
        const imageUrl = this.getElement('productImageUrl').value;
        
        if (!name || !price || price <= 0) {
            this.showAlert('Please fill in all required fields with valid values');
            return;
        }
        
        const specificData = {};
        if (type === ProductType.DRINK) {
            specificData.size = this.getElement('productSize').value;
            specificData.isHot = this.getElement('productIsHot').checked;
        } else {
            specificData.isVegetarian = this.getElement('productIsVegetarian').checked;
        }
        
        try {
            if (this.currentEditingProduct) {
                const updates = { name, price, ...specificData };
                if (imageUrl) updates.imageUrl = imageUrl;
                this.app.productManager.updateProduct(this.currentEditingProduct, updates, this.app.currentSession);
                this.showAlert('Product updated successfully!', 'success');
            } else {
                this.app.productManager.createProduct(name, price, type, specificData, this.app.currentSession, imageUrl);
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

    // Checkout Methods
    openCheckoutModal() {
        const modal = this.getElement('checkoutModal');
        const orderType = this.getElement('orderType');
        const deliveryAddress = this.getElement('deliveryAddress');
        
        if (orderType) orderType.value = 'REGULAR_ORDER';
        if (deliveryAddress) deliveryAddress.value = '';
        
        this.loadCheckoutCartItems();
        modal.style.display = 'block';
    }

    closeCheckoutModal() {
        this.getElement('checkoutModal').style.display = 'none';
    }

    loadCheckoutCartItems() {
        if (!this.app.currentSession || this.app.userManager.isAdmin(this.app.currentSession)) return;
        
        try {
            const cartItems = this.app.cartManager.getCart(this.app.currentSession);
            const checkoutCartItems = this.getElement('checkoutCartItems');
            
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
                
                checkoutItem.innerHTML = `
                    <div class="checkout-item-image">
                        <img src="${product.imageUrl || product.imageURL}" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/50x50/8B4513/FFFFFF?text=${encodeURIComponent(product.name.charAt(0))}'">
                    </div>
                    <div class="checkout-item-info">
                        <h6>${product.name}</h6>
                        <p class="checkout-item-qty">Quantity: ${item.quantity}</p>
                        ${product.type === ProductType.DRINK ? `<p>Size: ${item.size}</p>` : ''}
                    </div>
                    <div class="checkout-item-controls">
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

    placeOrder() {
        const orderType = this.getElement('orderType').value;
        const deliveryAddress = this.getElement('deliveryAddress').value;
        
        if (!deliveryAddress.trim()) {
            this.showAlert('Please enter a delivery address');
            return;
        }
        
        const orderData = { deliveryAddress };
        
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

    // Utility Methods
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    }

    setupEventListeners() {
        // Close modals when clicking outside or pressing ESC
        window.onclick = (event) => {
            const productModal = this.getElement('productModal');
            const checkoutModal = this.getElement('checkoutModal');
            
            if (event.target === productModal) this.closeProductModal();
            if (event.target === checkoutModal) this.closeCheckoutModal();
        };
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeProductModal();
                this.closeCheckoutModal();
            }
        });
    }
}