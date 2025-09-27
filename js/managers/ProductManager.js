// managers/ProductManager.js - Fixed version
import { ValidationException, AuthorizationException } from '../exceptions.js';
import { ProductType } from '../constants.js';
import { Drink } from '../classes/Drink.js';
import { Food } from '../classes/Food.js';

export class ProductManager {
    constructor(userManager) {
        this.products = new Map();
        this.userManager = userManager;
    }

    validateProductInput(name, price) {
        if (!name || name.trim() === '') {
            throw new ValidationException("Product name is required");
        }
        if (!price || price <= 0) {
            throw new ValidationException("Product price must be positive");
        }
    }

    createProduct(name, price, type, specificData, sessionToken, imageUrl = null) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can create products");
        }
        
        this.validateProductInput(name, price);

        const productImageUrl = imageUrl || this.getDefaultImageUrl(name, type);

        let product;
        if (type === ProductType.DRINK) {
            product = new Drink(
                name, 
                price, 
                productImageUrl, 
                specificData.size || 'M', 
                specificData.isHot !== undefined ? specificData.isHot : true
            );
        } else {
            product = new Food(
                name, 
                price, 
                productImageUrl, 
                specificData.isVegetarian !== undefined ? specificData.isVegetarian : false
            );
        }

        this.products.set(product.id, product);
        console.log(`Product created: ${product.name} with ID: ${product.id}`);
        return product;
    }

    // Helper method to generate default images based on product type
    getDefaultImageUrl(name, type) {
        const encodedName = encodeURIComponent(name);
        if (type === ProductType.DRINK) {
            return `https://via.placeholder.com/300x200/8B4513/FFFFFF?text=☕+${encodedName}`;
        } else {
            return `https://via.placeholder.com/300x200/D2691E/FFFFFF?text=🍽️+${encodedName}`;
        }
    }

    updateProduct(productId, updates, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can update products");
        }

        const product = this.products.get(productId);
        if (!product) {
            throw new ValidationException("Product not found");
        }

        // Validate updates if they include required fields
        if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
            throw new ValidationException("Product name cannot be empty");
        }
        if (updates.price !== undefined && updates.price <= 0) {
            throw new ValidationException("Product price must be positive");
        }

        Object.assign(product, updates);
        console.log(`Product updated: ${product.name}`);
        return product;
    }

    deleteProduct(productId, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can delete products");
        }
        
        const product = this.products.get(productId);
        if (product) {
            console.log(`Product deleted: ${product.name}`);
        }
        return this.products.delete(productId);
    }

    getAllProducts() {
        const availableProducts = Array.from(this.products.values()).filter(p => p.isAvailable);
        console.log(`Retrieved ${availableProducts.length} available products`);
        return availableProducts;
    }

    getProductsByType(type) {
        return this.getAllProducts().filter(product => product.type === type);
    }

    getProductById(productId) {
        return this.products.get(productId);
    }

    // Helper method for debugging
    getProductCount() {
        return this.products.size;
    }

    // Helper method to list all product names
    listProductNames() {
        return Array.from(this.products.values()).map(p => p.name);
    }
}