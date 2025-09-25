class CartManager {
    constructor() {
        this.cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    }

    _saveCart() {
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
    }

    getCart() {
        return this.cart;
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.productId === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const cartItem = new CartItem(product, quantity);
            this.cart.push(cartItem);
        }
        this._saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this._saveCart();
            }
        }
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this._saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.cart = [];
        this._saveCart();
    }
}
