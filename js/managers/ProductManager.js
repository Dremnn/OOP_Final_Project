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

    validateProductInput(name, description, price, imageUrl) {
        if (!name) throw new ValidationException("Product name is required");
        if (price <= 0) throw new ValidationException("Product price must be positive");
        if (!imageUrl) throw new ValidationException("Product image URL is required");
    }

    createProduct(name, description, price, imageUrl, type, specificData, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can create products");
        }
        // Truyền imageUrl vào hàm validation
        this.validateProductInput(name, description, price, imageUrl);

        let product;
        if (type === ProductType.DRINK) {
            // Truyền imageUrl khi tạo đối tượng Drink
            product = new Drink(name, description, price, imageUrl, specificData.size, specificData.isHot);
        } else {
            // Truyền imageUrl khi tạo đối tượng Food
            product = new Food(name, description, price, imageUrl, specificData.isVegetarian);
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