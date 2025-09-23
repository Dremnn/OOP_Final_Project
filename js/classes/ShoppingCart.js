export default class ShoppingCart {
    constructor() {
        this.items = []; // Mảng chứa { product, quantity }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ product: product, quantity: 1 });
        }
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    clear() {
        this.items = [];
    }
}

