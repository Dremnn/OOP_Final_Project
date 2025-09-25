class User {
    constructor(username, password, isAdmin = false) {
        this.username = username;
        this.password = password; // In a real app, this would be hashed
        this.isAdmin = isAdmin;
    }
}
