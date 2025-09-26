// Base User class
export class User {
    constructor(username, password, phoneNumber, role) {
        this.username = username;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    canAccessOrder(orderId) {
        throw new Error("Abstract method must be implemented");
    }

    canModifyProduct() {
        throw new Error("Abstract method must be implemented");
    }
}