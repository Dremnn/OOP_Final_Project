import Order from '../classes/Order.js';
import { DBService } from '../services/DBService.js';

/**
 * OrderManager: Chịu trách nhiệm tạo và lấy lịch sử đơn hàng.
 */
export default class OrderManager {
    constructor() {
        this.orders = [];
    }

    /**
     * Tạo một đơn hàng mới từ giỏ hàng.
     * @param {CartManager} cart - Đối tượng giỏ hàng.
     * @returns {Promise<Order | null>} - Trả về đơn hàng mới hoặc null nếu giỏ hàng rỗng.
     */
    async createOrder(cart) {
        if (cart.items.length === 0) return null;

        const newOrder = new Order(
            `order_${Date.now()}`,
            cart.items,
            cart.calculateTotal(),
            new Date().toISOString()
        );
        
        // Lưu đơn hàng mới vào IndexedDB
        await DBService.saveData('orders', [newOrder]);
        this.orders.push(newOrder);
        return newOrder;
    }

    /**
     * Tải tất cả đơn hàng từ IndexedDB.
     * @returns {Promise<Array<Order>>} - Mảng các đơn hàng.
     */
    async loadOrders() {
        const ordersData = await DBService.getAllData('orders');
        this.orders = ordersData.map(o => new Order(o.id, o.items, o.total, o.date, o.status));
        return this.orders;
    }
}

