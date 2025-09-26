export class CartItem {
    constructor(productId, customerId, quantity, unitPrice) {
        this.id = this.generateId();
        this.productId = productId;
        this.customerId = customerId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = quantity * unitPrice;
        this.customizations = {};
        this.addedAt = new Date();
    }

    generateId() {
        return 'ITEM' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    updateQuantity(newQuantity) {
        this.quantity = newQuantity;
        this.totalPrice = this.quantity * this.unitPrice;
    }
}