import { OrderStatus } from '../constants.js';

export class Order {
    constructor(customerId, items, orderType) {
        this.id = this.generateId();
        this.customerId = customerId;
        this.items = items;
        this.orderType = orderType;
        this.status = OrderStatus.PENDING;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.notes = '';
        this.calculateTotal();
    }

    generateId() {
        return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    calculateTotal() {
        this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
        this.tax = this.subtotal * 0.1;
        this.total = this.subtotal + this.tax + this.getDeliveryFee();
    }

    getDeliveryFee() {
        throw new Error("Abstract method must be implemented");
    }

    getEstimatedPreparationTime() {
        throw new Error("Abstract method must be implemented");
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        this.updatedAt = new Date();
    }
}