export class Product {
    constructor(name, price, imageUrl, type) {
        this.id = this.generateId();
        this.name = name;
        this.price = price;
        this.type = type;
        this.imageUrl = imageUrl;
        this.isAvailable = true;
    }

    generateId() {
        return 'PROD' + Date.now() + Math.random().toString(36).substr(2, 9);
    }
}