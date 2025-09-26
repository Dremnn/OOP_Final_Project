// classes/Product.js

export class Product {
    constructor(name, description, price, imageUrl, type) { // Thêm imageUrl vào đây
        this.id = this.generateId();
        this.name = name;
        this.description = description;
        this.price = price;
        this.type = type;
        this.imageUrl = imageUrl; // Gán giá trị được truyền vào
        this.isAvailable = true;
    }

    generateId() {
        return 'PROD' + Date.now() + Math.random().toString(36).substr(2, 9);
    }
}