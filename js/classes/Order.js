class Order {
    constructor(id, userId, items, total, date, status = 'Pending') {
        this.id = id;
        this.userId = userId;
        this.items = items; // array of { productId, name, quantity, price }
        this.total = total;
        this.date = date;
        this.status = status;
    }
}
