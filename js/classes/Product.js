// Base Product class
export class Product {
    constructor(name, description, price, type) {
        this.id = this.generateId();
        this.name = name;
        this.description = description;
        this.price = price;
        this.type = type;
        this.imageUrl = '';
        this.isAvailable = true;
    }

    generateId() {
        return 'PROD' + Date.now() + Math.random().toString(36).substr(2, 9);
    }
}