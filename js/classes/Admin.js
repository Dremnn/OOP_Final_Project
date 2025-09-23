import User from './User.js';

/**
 * LỚP CON - Admin: Kế thừa từ User.
 * Đại diện cho một quản trị viên của hệ thống.
 */
export default class Admin extends User {
    /**
     * @param {string} username - Tên đăng nhập.
     */
    constructor(username) {
        // Gọi constructor của lớp cha (User) với vai trò cố định là 'admin'
        super(username, 'admin');

        // Thuộc tính riêng của Admin, ví dụ: quyền hạn
        // Trong thực tế, quyền hạn này sẽ được tải từ server.
        this.permissions = ['manage_products', 'view_reports', 'manage_users'];
    }

    /**
     * Phương thức riêng của Admin để kiểm tra quyền.
     * @param {string} permission - Quyền cần kiểm tra.
     * @returns {boolean} - True nếu có quyền, false nếu không.
     */
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }
}

