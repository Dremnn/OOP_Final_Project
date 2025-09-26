import { Customer } from '../classes/Customer.js';
import { Admin } from '../classes/Admin.js';
import { UserRole } from '../constants.js';
import { AuthenticationException, ValidationException } from '../exceptions.js';

export class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    validateUserInput(username, password, phoneNumber) {
        if (!username) throw new ValidationException("Username is required");
        if (password.length < 6) throw new ValidationException("Password must be at least 6 characters");
        if (!phoneNumber) throw new ValidationException("Phone number is required");
    }

    userExists(username) {
        for (let user of this.users.values()) {
            if (user.username === username) return true;
        }
        return false;
    }

    hashPassword(password) {
        return password; // Placeholder - in real app use proper hashing
    }

    verifyPassword(password, hashedPassword) {
        return password === hashedPassword; // Placeholder
    }

    generateSessionToken() {
        return 'TOKEN' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    login(username, password) {
        let user = null;
        for (let u of this.users.values()) {
            if (u.username === username) {
                user = u;
                break;
            }
        }

        if (!user) {
            throw new AuthenticationException("User not found");
        }
        if (!this.verifyPassword(password, user.password)) {
            throw new AuthenticationException("Invalid password");
        }

        const sessionToken = this.generateSessionToken();
        const userId = user instanceof Customer ? user.id : user.username;
        this.sessions.set(sessionToken, userId);
        return sessionToken;
    }

    logout(sessionToken) {
        return this.sessions.delete(sessionToken);
    }

    registerUser(username, password, phoneNumber, role) {
        this.validateUserInput(username, password, phoneNumber);
        if (this.userExists(username)) {
            throw new ValidationException("User with this username already exists");
        }

        const hashedPassword = this.hashPassword(password);
        let newUser;

        if (role === UserRole.CUSTOMER) {
            newUser = new Customer(username, hashedPassword, phoneNumber);
            this.users.set(newUser.id, newUser);
        } else {
            newUser = new Admin(username, hashedPassword, phoneNumber);
            this.users.set(newUser.username, newUser);
        }

        return newUser;
    }

    getCurrentUser(sessionToken) {
        const userId = this.sessions.get(sessionToken);
        return userId ? this.users.get(userId) : null;
    }

    isAdmin(sessionToken) {
        const user = this.getCurrentUser(sessionToken);
        return user && user instanceof Admin;
    }
}