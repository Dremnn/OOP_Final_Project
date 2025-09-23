/**
 * LỚP CHA - User: Chứa các thông tin cơ bản nhất.
 * Cả Customer và Admin đều sẽ kế thừa từ lớp này.
 */
export default class User {
    /**
     * @param {string} username - Tên đăng nhập.
     * @param {'customer' | 'admin'} role - Vai trò của người dùng.
     */
    constructor(username, role) {
        // Ngăn chặn việc tạo đối tượng trực tiếp từ lớp User (lớp trừu tượng)
        if (this.constructor === User) {
            throw new Error("Cannot instantiate abstract class User directly.");
        }
        this.username = username;
        this.role = role;
    }
}

