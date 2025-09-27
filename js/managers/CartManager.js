// managers/CartManager.js
import { AuthorizationException, ValidationException } from '../exceptions.js';
import { Customer } from '../classes/Customer.js';
import { CartItem } from '../classes/CartItem.js';
import { ProductType } from '../constants.js';

export class CartManager {
    constructor(userManager, productManager) {
        this.userCarts = new Map();
        this.userManager = userManager;
        this.productManager = productManager;
    }

    addToCart(productId, quantity, sessionToken, size = 'M') {
        const user = this.userManager.getCurrentUser(sessionToken);
        if (!(user instanceof Customer)) {
            throw new AuthorizationException("Only customers can add items to cart");
        }

        const product = this.productManager.getProductById(productId);
        if (!product || !product.isAvailable) {
            throw new ValidationException("Product not available");
        }

        const customerId = user.id;
        if (!this.userCarts.has(customerId)) {
            this.userCarts.set(customerId, []);
        }

        // For drinks, use the selected size; for food, default to 'M' but doesn't affect price
        const itemSize = product.type === ProductType.DRINK ? size : 'M';
        const cartItem = new CartItem(productId, customerId, quantity, product.price, itemSize);
        this.userCarts.get(customerId).push(cartItem);
        return cartItem;
    }

    getCart(sessionToken) {
        const user = this.userManager.getCurrentUser(sessionToken);
        if (!(user instanceof Customer)) {
            throw new AuthorizationException("Only customers can view cart");
        }
        return this.userCarts.get(user.id) || [];
    }

    updateCartItemQuantity(itemId, newQuantity, sessionToken) {
        const cart = this.getCart(sessionToken);
        const item = cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                const index = cart.indexOf(item);
                cart.splice(index, 1);
            } else {
                item.updateQuantity(newQuantity);
            }
        }
    }

    // ADD: New method to update cart item size
    updateCartItemSize(itemId, newSize, sessionToken) {
        const cart = this.getCart(sessionToken);
        const item = cart.find(item => item.id === itemId);
        if (item) {
            const product = this.productManager.getProductById(item.productId);
            // Only allow size change for drinks
            if (product && product.type === ProductType.DRINK) {
                item.updateSize(newSize);
            }
        }
        return item;
    }

    clearCart(customerId) {
        this.userCarts.delete(customerId);
    }
}