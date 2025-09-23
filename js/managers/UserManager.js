import Customer from '../classes/Customer.js';
import Admin from '../classes/Admin.js';
import { DBService } from '../services/DBService.js';

/**
 * UserManager: Được nâng cấp để xử lý các lớp con Customer và Admin.
 */
export default class UserManager {
    constructor() {
        /** @type {Customer | Admin | null} */
        this.currentUser = null;
    }

    /**
     * Logic đăng nhập được cập nhật.
     * Sẽ tạo đối tượng Customer hoặc Admin tùy theo username.
     * @param {string} username - Tên đăng nhập.
     * @param {string} password - Mật khẩu.
     * @returns {Promise<boolean>} - True nếu đăng nhập thành công.
     */
    async login(username, password) {
        if (!username || !password) return false;

        // --- MÔ PHỎNG LOGIC PHÂN BIỆT VAI TRÒ ---
        // Trong thực tế, vai trò sẽ được trả về từ server sau khi xác thực.
        // Ở đây, chúng ta giả định 'admin' là admin, còn lại là customer.
        const isAdmin = (username.toLowerCase() === 'admin');

        if (isAdmin) {
            // Logic cho Admin
            // Ở đây ta bỏ qua việc lưu Admin vào DB để đơn giản hóa phần client
            this.currentUser = new Admin(username);
            // Lưu thông tin phiên đăng nhập vào sessionStorage
            sessionStorage.setItem('loggedInUser', JSON.stringify({ username, role: 'admin' }));
        } else {
            // Logic cho Customer
            let userData = await DBService.getData('users', username);
            if (!userData) {
                // Tạo Customer mới nếu chưa có trong DB, tặng 100 điểm khởi đầu
                userData = { username, loyaltyPoints: 100, role: 'customer' };
                await DBService.saveData('users', [userData]);
            }
            this.currentUser = new Customer(userData.username, userData.loyaltyPoints);
            sessionStorage.setItem('loggedInUser', JSON.stringify({ username, role: 'customer' }));
        }
        
        return true;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('loggedInUser');
    }

    /**
     * Khôi phục phiên đăng nhập, tạo lại đúng đối tượng Customer/Admin.
     * @returns {Promise<boolean>} - True nếu khôi phục thành công.
     */
    async resumeSession() {
        const sessionDataString = sessionStorage.getItem('loggedInUser');
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            // Đăng nhập lại một cách "im lặng" để tái tạo đúng đối tượng
            await this.login(sessionData.username, 'dummy_password'); 
            return true;
        }
        return false;
    }

    /**
     * Cộng điểm thưởng, giờ sẽ gọi phương thức của đối tượng Customer.
     * @param {number} orderTotal - Tổng giá trị đơn hàng.
     */
    async addPointsForOrder(orderTotal) {
        // Chỉ cộng điểm nếu người dùng hiện tại là Customer
        if (this.currentUser && this.currentUser instanceof Customer) {
            // Logic: 10,000đ = 1 điểm
            const pointsEarned = Math.floor(orderTotal / 10000);
            
            // Gọi phương thức của chính đối tượng Customer
            this.currentUser.addLoyaltyPoints(pointsEarned);
            
            // Cập nhật lại thông tin trong DB
            await DBService.saveData('users', [{
                username: this.currentUser.username,
                loyaltyPoints: this.currentUser.loyaltyPoints,
                role: 'customer'
            }]);
        }
    }
}

