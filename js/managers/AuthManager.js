class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
        
        // Add a default admin user if one doesn't exist
        if (!this.users.find(u => u.username === 'admin')) {
            this.users.push(new User('admin', 'admin123', true));
            this._saveUsers();
        }
    }

    _saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    _saveSession() {
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    register(username, password) {
        if (this.users.find(user => user.username === username)) {
            throw new Error('Tên đăng nhập đã tồn tại.');
        }
        const newUser = new User(username, password);
        this.users.push(newUser);
        this._saveUsers();
        return newUser;
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
        this.currentUser = user;
        this._saveSession();
        return user;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }
}
