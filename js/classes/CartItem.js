export class CartItem {
    constructor(productId, customerId, quantity, unitPrice, size = 'M') {
        this.id = this.generateId();
        this.productId = productId;
        this.customerId = customerId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.size = size; // ADD: Default size is Medium
        this.baseTotalPrice = quantity * unitPrice;
        this.totalPrice = this.calculateTotalWithSize();
        this.customizations = {};
        this.addedAt = new Date();
    }

    generateId() {
        return 'ITEM' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // ADD: Calculate total price with size multiplier
    calculateTotalWithSize() {
        // Import SizeMultipliers dynamically or pass it as parameter
        const sizeMultipliers = {
            S: 0.8,
            M: 1.0,
            L: 1.3
        };
        
        const multiplier = sizeMultipliers[this.size] || 1.0;
        return this.baseTotalPrice * multiplier;
    }

    updateQuantity(newQuantity) {
        this.quantity = newQuantity;
        this.baseTotalPrice = this.quantity * this.unitPrice;
        this.totalPrice = this.calculateTotalWithSize();
    }

    // ADD: Method to update size
    updateSize(newSize) {
        this.size = newSize;
        this.totalPrice = this.calculateTotalWithSize();
    }

    // ADD: Get unit price with size multiplier
    getUnitPriceWithSize() {
        const sizeMultipliers = {
            S: 0.8,
            M: 1.0,
            L: 1.3
        };
        
        const multiplier = sizeMultipliers[this.size] || 1.0;
        return this.unitPrice * multiplier;
    }
}