import { User } from './User.js';
import { UserRole } from '../constants.js';

export class Admin extends User {
    constructor(username, password, phoneNumber) {
        super(username, password, phoneNumber, UserRole.ADMIN);
        this.permissions = ['MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'VIEW_ALL_ORDERS'];
    }

    canAccessOrder(orderId) {
        return true;
    }

    canModifyProduct() {
        return true;
    }
}