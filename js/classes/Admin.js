import User from './User.js';
import { UserRole } from '../constants.js';

// Admin class
export default class Admin extends User {
    constructor(username, password, phoneNumber) {
        super(username, password, phoneNumber, UserRole.ADMIN);
        this.id = `ADMIN${Date.now()}`;
        this.permissions = ["MANAGE_PRODUCTS", "MANAGE_ORDERS", "VIEW_ALL_ORDERS"];
    }
    canAccessOrder(orderId) {
        return true; // Admin can access all orders
    }
    canModifyProduct() {
        return true;
    }
}
