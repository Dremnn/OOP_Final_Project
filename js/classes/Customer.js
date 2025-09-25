import User from './User.js';
import { UserRole } from '../constants.js';

// Customer class
export default class Customer extends User {
    constructor(username, password, phoneNumber) {
        super(username, password, phoneNumber, UserRole.CUSTOMER);
        this.id = `CUST${Date.now()}`;
        this.address = '';
        this.orderHistory = []; // Array of order IDs
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
