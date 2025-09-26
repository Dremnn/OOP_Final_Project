import { User } from './User.js';
import { UserRole } from '../constants.js';

export class Customer extends User {
    constructor(username, password, phoneNumber) {
        super(username, password, phoneNumber, UserRole.CUSTOMER);
        this.id = this.generateId();
        this.address = '';
        this.orderHistory = [];
    }

    generateId() {
        return 'CUST' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    canAccessOrder(orderId) {
        return this.orderHistory.includes(orderId);
    }

    canModifyProduct() {
        return false;
    }

    addOrderToHistory(orderId) {
        this.orderHistory.push(orderId);
    }
}