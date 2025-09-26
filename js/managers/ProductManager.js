// managers/ProductManager.js
import { ValidationException, AuthorizationException } from '../exceptions.js';
import { ProductType } from '../constants.js';
import { Drink } from '../classes/Drink.js';
import { Food } from '../classes/Food.js';

export class ProductManager {
    constructor(userManager) {
        this.products = new Map();
        this.userManager = userManager;
    }

    validateProductInput(name, description, price) {
        if (!name) throw new ValidationException("Product name is required");
        if (price <= 0) throw new ValidationException("Product price must be positive");
    }

    createProduct(name, description, price, type, specificData, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can create products");
        }
        this.validateProductInput(name, description, price);

        let product;
        if (type === ProductType.DRINK) {
            product = new Drink(name, description, price, specificData.size, specificData.isHot);
        } else {
            product = new Food(name, description, price, specificData.isVegetarian);
        }

        this.products.set(product.id, product);
        return product;
    }

    updateProduct(productId, updates, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can update products");
        }

        const product = this.products.get(productId);
        if (!product) {
            throw new ValidationException("Product not found");
        }

        Object.assign(product, updates);
        return product;
    }

    deleteProduct(productId, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can delete products");
        }
        return this.products.delete(productId);
    }

    getAllProducts() {
        return Array.from(this.products.values()).filter(p => p.isAvailable);
    }

    getProductById(productId) {
        return this.products.get(productId);
    }
}