class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    _saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    _generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    placeOrder(userId, cartItems, total) {
        if (!cartItems || cartItems.length === 0) {
            throw new Error('Giỏ hàng trống.');
        }
        const id = this._generateId();
        const date = new Date().toISOString();
        const newOrder = new Order(id, userId, cartItems, total, date);
        this.orders.push(newOrder);
        this._saveOrders();
        return newOrder;
    }

    getOrdersByUser(userId) {
        return this.orders.filter(order => order.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    getAllOrders() {
        return this.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this._saveOrders();
            return order;
        }
        throw new Error('Không tìm thấy đơn hàng.');
    }
}
