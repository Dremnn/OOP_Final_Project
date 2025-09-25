class UIManager {
    constructor() {
        // Auth elements
        this.authSection = document.getElementById('authSection');
        this.mainApp = document.getElementById('mainApp');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.showRegisterLink = document.getElementById('showRegister');
        this.showLoginLink = document.getElementById('showLogin');
        this.authAlert = document.getElementById('authAlert');

        // Main app elements
        this.currentUserSpan = document.getElementById('currentUser');
        this.productList = document.getElementById('productList');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartTotalSpan = document.getElementById('cartTotal');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.orderListContainer = document.getElementById('orderList');

        // Product Modal elements
        this.productModal = document.getElementById('productModal');
        this.productModalTitle = document.getElementById('productModalTitle');
        this.productForm = document.getElementById('productForm');
        this.closeProductModalBtn = document.getElementById('closeProductModal');
    }

    // --- VIEW TOGGLING ---
    showAuth() {
        this.authSection.style.display = 'block';
        this.mainApp.style.display = 'none';
        this.showLogin(); // Default to login form
        this.authAlert.innerHTML = `
            <div class="alert alert-success">
                <strong>Tài khoản Demo:</strong><br>
                Admin: Tên đăng nhập "admin", Mật khẩu "admin123"<br>
                Hoặc đăng ký tài khoản khách hàng mới.
            </div>
        `;
    }

    showApp() {
        this.authSection.style.display = 'none';
        this.mainApp.style.display = 'block';
    }

    showLogin() {
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
    }
    
    showRegister() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
    }

    // --- RENDERING ---

    renderUserInfo(user) {
        this.currentUserSpan.textContent = `Xin chào, ${user.username}`;
        // Show admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = user.isAdmin ? 'block' : 'none';
        });
    }

    renderProducts(products, isAdmin, onAddToCart, onEdit, onDelete) {
        this.productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://placehold.co/300x200/cccccc/ffffff?text=Image+Error'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                    <div class="product-actions">
                        ${!isAdmin ? `<button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${product.id}">Thêm vào giỏ</button>` : ''}
                    </div>
                     ${isAdmin ? `
                        <div class="admin-product-actions">
                            <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${product.id}">Sửa</button>
                            <button class="btn btn-danger btn-sm delete-product-btn" data-id="${product.id}">Xóa</button>
                        </div>` : ''}
                </div>
            `;
            this.productList.appendChild(card);
        });

        // Add event listeners after rendering
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => btn.addEventListener('click', () => onAddToCart(btn.dataset.id)));
        if (isAdmin) {
             document.querySelectorAll('.edit-product-btn').forEach(btn => btn.addEventListener('click', () => onEdit(btn.dataset.id)));
             document.querySelectorAll('.delete-product-btn').forEach(btn => btn.addEventListener('click', () => onDelete(btn.dataset.id)));
        }
    }
    
    renderCart(cart, cartTotal, onUpdateQuantity, onRemoveItem) {
        this.cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            this.cartItemsContainer.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
        } else {
             cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">${this.formatPrice(item.price)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.productId}">
                        <button class="btn btn-danger btn-sm remove-item-btn" data-id="${item.productId}">&times;</button>
                    </div>
                `;
                this.cartItemsContainer.appendChild(itemEl);
            });
        }
       
        this.cartTotalSpan.textContent = this.formatPrice(cartTotal);
        this.checkoutBtn.disabled = cart.length === 0;

        // Add event listeners
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (e) => onUpdateQuantity(e.target.dataset.id, parseInt(e.target.value)));
        });
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => onRemoveItem(e.target.closest('button').dataset.id));
        });
    }

    renderOrders(orders, isAdmin, onUpdateStatus) {
        this.orderListContainer.innerHTML = '';
        if (orders.length === 0) {
            this.orderListContainer.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
            return;
        }

        orders.forEach(order => {
            const orderEl = document.createElement('div');
            orderEl.className = 'order-item';
            
            const itemsHtml = order.items.map(item => `<li>${item.quantity} x ${item.name}</li>`).join('');

            const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled']
                .map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`)
                .join('');
            
            orderEl.innerHTML = `
                <div class="order-header">
                    <span>${new Date(order.date).toLocaleDateString('vi-VN')}</span>
                     <span class="order-id">#${order.id.substr(-6)}</span>
                </div>
                <ul>${itemsHtml}</ul>
                <div class="order-footer">
                    <span class="order-total">${this.formatPrice(order.total)}</span>
                    ${isAdmin ? `
                        <select class="form-control status-select" data-id="${order.id}">${statusOptions}</select>
                    ` : `
                        <span class="order-status">${order.status}</span>
                    `}
                </div>
            `;
            this.orderListContainer.appendChild(orderEl);
        });

        if (isAdmin) {
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', (e) => onUpdateStatus(e.target.dataset.id, e.target.value));
            });
        }
    }


    // --- MODAL ---
    
    openProductModal(product = null) {
        this.productForm.reset();
        if (product) {
            this.productModalTitle.textContent = 'Sửa Sản phẩm';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description;
        } else {
            this.productModalTitle.textContent = 'Thêm Sản phẩm';
            document.getElementById('productId').value = '';
        }
        this.productModal.style.display = 'block';
    }

    closeProductModal() {
        this.productModal.style.display = 'none';
    }

    // --- UTILS ---
    showAlert(message, type = 'danger') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        // For auth form alerts
        const authContainer = document.getElementById('auth-forms-container');
        authContainer.insertBefore(alertDiv, authContainer.firstChild);
        
        setTimeout(() => alertDiv.remove(), 3000);
    }
    
    showAppAlert(message, type = 'success') {
         const alertDiv = document.createElement('div');
         alertDiv.className = `alert alert-${type}`;
         alertDiv.style.position = 'fixed';
         alertDiv.style.top = '20px';
         alertDiv.style.right = '20px';
         alertDiv.style.zIndex = '2000';
         alertDiv.textContent = message;
         document.body.appendChild(alertDiv);
         setTimeout(() => alertDiv.remove(), 3000);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }
}
