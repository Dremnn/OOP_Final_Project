import User from './User.js';

/**
 * LỚP CON - Customer: Kế thừa từ User.
 * Đại diện cho một khách hàng của quán.
 */
export default class Customer extends User {
    /**
     * @param {string} username - Tên đăng nhập.
     * @param {number} [loyaltyPoints=0] - Điểm thưởng, mặc định là 0.
     */
    constructor(username, loyaltyPoints = 0) {
        // Gọi constructor của lớp cha (User) với vai trò cố định là 'customer'
        super(username, 'customer'); 
        
        // Thêm thuộc tính riêng của Customer
        this.loyaltyPoints = loyaltyPoints;
    }

    /**
     * Phương thức riêng của Customer để cộng điểm thưởng.
     * @param {number} points - Số điểm cần cộng.
     */
    addLoyaltyPoints(points) {
        if (points > 0) {
            this.loyaltyPoints += points;
        }
    }
}

