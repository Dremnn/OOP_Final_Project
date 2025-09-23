/**
 * UIManager: Chịu trách nhiệm cho tất cả các thao tác cập nhật trên DOM.
 * Giúp tách biệt logic hiển thị ra khỏi logic nghiệp vụ.
 */
export default class UIManager {
    constructor() {
        // Lấy tất cả các DOM element cần thiết một lần duy nhất
        this.elements = {
            loadingOverlay: document.getElementById('loading-overlay'),
            loginPage: document.getElementById('login-page'),
            appContainer: document.getElementById('app-container'),
            pages: document.querySelectorAll('.page'),
            navItems: document.querySelectorAll('.nav-item'),
            productList: document.getElementById('product-list'),
            orderList: document.getElementById('order-list'),
            cartButton: document.getElementById('cart-button'),
            cartCount: document.getElementById('cart-count'),
            cartModal: document.getElementById('cart-modal'),
            modalCartItems: document.getElementById('modal-cart-items'),
            modalTotalPrice: document.getElementById('modal-total-price'),
            checkoutButton: document.getElementById('checkout-button'),
            headerUsername: document.getElementById('header-username'),
            profileUsername: document.getElementById('profile-username'),
            loyaltySection: document.getElementById('loyalty-section'),
            loyaltyPoints: document.getElementById('loyalty-points'),
        };
    }

    showLoading() { this.elements.loadingOverlay.style.display = 'flex'; }
    hideLoading() {
        this.elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => this.elements.loadingOverlay.style.display = 'none', 500);
    }

    /**
     * Hiển thị một trang cụ thể và ẩn các trang khác.
     * @param {string} pageId - ID của page div.
     */
    showPage(pageId) {
        if (pageId === 'login-page') {
            this.elements.loginPage.style.display = 'flex';
            this.elements.appContainer.style.display = 'none';
        } else {
            this.elements.loginPage.style.display = 'none';
            this.elements.appContainer.style.display = 'block';
            this.elements.pages.forEach(p => p.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');
        }
    }
    
    /**
     * Cập nhật trạng thái active cho thanh điều hướng.
     * @param {string} pageId - ID của trang đang active.
     */
    updateActiveNav(pageId) {
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
    }

    /**
     * Render danh sách sản phẩm ra màn hình.
     * @param {Array<Product>} products - Mảng các đối tượng Product.
     * @param {User} currentUser - Người dùng hiện tại để quyết định có hiển thị nút add hay không.
     */
    renderProducts(products, currentUser) {
        this.elements.productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            // Chỉ hiển thị nút "Thêm vào giỏ" nếu người dùng là customer
            const addButton = currentUser.role === 'customer' 
                ? `<button class="btn-add-to-cart" data-product-id="${product.id}">
                       <i class="fas fa-plus"></i>
                   </button>`
                : '';
            
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" onerror="this.onerror=null;this.src='https://placehold.co/120x120/ccc/fff?text=IMG';">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">${product.price.toLocaleString('vi-VN')}đ</span>
                        ${addButton}
                    </div>
                </div>
            `;
            this.elements.productList.appendChild(card);
        });
    }

    /**
     * Cập nhật hiển thị của giỏ hàng (số lượng và modal).
     * @param {CartManager} cart - Đối tượng CartManager.
     */
    updateCart(cart) {
        const totalItems = cart.getTotalItems();
        this.elements.cartCount.textContent = totalItems;
        this.elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

        this.elements.modalCartItems.innerHTML = '';
        if (cart.items.length === 0) {
            this.elements.modalCartItems.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
        } else {
             cart.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-cart-item';
                itemEl.innerHTML = `<span>${item.product.name} (x${item.quantity})</span> <span>${(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</span>`;
                this.elements.modalCartItems.appendChild(itemEl);
            });
        }
        this.elements.modalTotalPrice.textContent = `${cart.calculateTotal().toLocaleString('vi-VN')}đ`;
        this.elements.checkoutButton.disabled = cart.items.length === 0;
    }

    toggleCartModal(show = true) {
        this.elements.cartModal.classList.toggle('active', show);
    }
    
    /**
     * Render danh sách đơn hàng.
     * @param {Array<Order>} orders - Mảng các đối tượng Order.
     */
    renderOrders(orders) {
        this.elements.orderList.innerHTML = '';
        if (!orders || orders.length === 0) {
            this.elements.orderList.innerHTML = `<div class="appointment-container"><i class="fas fa-receipt appointment-icon"></i><p>Bạn chưa có đơn hàng nào.</p></div>`;
            return;
        }
        // Sắp xếp đơn hàng mới nhất lên đầu
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        orders.forEach(order => {
             const item = document.createElement('div');
             item.className = 'order-card';
             const formattedDate = new Date(order.date).toLocaleDateString('vi-VN');
             item.innerHTML = `
                <div class="order-card-header">
                    <span class="order-id">Đơn hàng #${order.id.substr(-6)}</span>
                    <span class="order-date">${formattedDate}</span>
                </div>
                <p>Tổng cộng: <strong class="order-total">${order.total.toLocaleString('vi-VN')}đ</strong></p>
             `;
             this.elements.orderList.appendChild(item);
        });
    }

    /**
     * Cập nhật thông tin người dùng trên giao diện.
     * @param {Customer | Admin} user - Đối tượng người dùng hiện tại.
     */
    updateProfile(user) {
        if (!user) return;
        this.elements.headerUsername.textContent = user.username;
        this.elements.profileUsername.textContent = user.username;

        // Xử lý hiển thị tùy theo vai trò
        if (user.role === 'customer') {
            this.elements.cartButton.style.display = 'block';
            this.elements.loyaltySection.style.display = 'block';
            this.elements.loyaltyPoints.textContent = user.loyaltyPoints.toLocaleString('vi-VN');
        } else if (user.role === 'admin') {
            // Ẩn các chức năng của customer cho admin
            this.elements.cartButton.style.display = 'none';
            this.elements.loyaltySection.style.display = 'none';
        }
    }
}

