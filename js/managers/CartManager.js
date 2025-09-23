/**
 * CartManager: Quản lý trạng thái và hành vi của giỏ hàng.
 */
export default class CartManager {
    constructor() {
        // Mảng chứa các item trong giỏ hàng, mỗi item có dạng { product: Product, quantity: number }
        this.items = [];
    }

    /**
     * Thêm một sản phẩm vào giỏ hàng. Nếu đã có, tăng số lượng.
     * @param {Product} product - Đối tượng sản phẩm cần thêm.
     */
    addItem(product) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ product, quantity: 1 });
        }
    }

    /**
     * Tính tổng giá trị của giỏ hàng.
     * @returns {number} - Tổng tiền.
     */
    calculateTotal() {
        return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }

    /**
     * Lấy tổng số lượng sản phẩm trong giỏ (tính cả số lượng của từng item).
     * @returns {number} - Tổng số sản phẩm.
     */
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Xóa sạch giỏ hàng.
     */
    clear() {
        this.items = [];
    }
}

