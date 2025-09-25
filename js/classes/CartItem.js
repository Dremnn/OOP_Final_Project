class CartItem {
    constructor(product, quantity = 1) {
        this.productId = product.id;
        this.name = product.name;
        this.price = product.price;
        this.quantity = quantity;
    }
}
