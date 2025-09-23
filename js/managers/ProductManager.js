import Drink from '../classes/Drink.js';
import Food from '../classes/Food.js';
import { ApiService } from '../services/ApiService.js';
import { DBService } from '../services/DBService.js';

/**
 * ProductManager: Chịu trách nhiệm tải và quản lý danh mục sản phẩm.
 */
export default class ProductManager {
    constructor() {
        this.products = [];
    }

    /**
     * Chuyển đổi dữ liệu thô thành một thực thể (instance) của lớp Drink hoặc Food.
     * @param {object} p - Dữ liệu sản phẩm thô.
     * @returns {Drink | Food | null}
     */
    #createProductInstance(p) {
        switch (p.type) {
            case 'drink':
                return new Drink(p.id, p.name, p.price, p.description, p.imageUrl, p.size);
            case 'food':
                return new Food(p.id, p.name, p.price, p.description, p.imageUrl, p.isVegetarian);
            default:
                console.warn('Loại sản phẩm không xác định:', p);
                return null; 
        }
    }

    async loadProducts() {
        let productsData = await DBService.getAllData('products');
        if (!productsData || productsData.length === 0) {
            productsData = await ApiService.getProducts();
            await DBService.saveData('products', productsData);
        }
        
        // Sửa lỗi: Truyền đúng tên thuộc tính (imageUrl, description) vào constructor
        this.products = productsData.map(p => this.#createProductInstance(p)).filter(Boolean);
        return this.products;
    }

    /**
     * Tìm một sản phẩm trong danh sách đã tải bằng ID.
     * @param {string} id - ID của sản phẩm.
     * @returns {Product | undefined} - Trả về sản phẩm nếu tìm thấy.
     */
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

        /**
     * Thêm một sản phẩm mới vào hệ thống.
     * @param {Object} productData - Dữ liệu thô từ form.
     */
    async addProduct(productData) {
        // Gán ID duy nhất cho sản phẩm mới
        const fullProductData = { ...productData, id: `prod_${Date.now()}` };
        // Tạo một thực thể lớp chính xác
        const newProductInstance = this.#createProductInstance(fullProductData);

        if (newProductInstance) {
            this.products.push(newProductInstance);
            // Lưu dữ liệu thô (plain object) vào DB
            await DBService.saveData('products', [fullProductData]);
        }
        return newProductInstance;
    }

    /**
     * Cập nhật một sản phẩm đã có.
     * @param {Object} productData - Dữ liệu thô từ form.
     */
    async updateProduct(productData) {
        const index = this.products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
            // Tạo một thực thể lớp chính xác
            const updatedInstance = this.#createProductInstance(productData);
            if (updatedInstance) {
                 // Cập nhật mảng products trong bộ nhớ với instance mới
                this.products[index] = updatedInstance;
                // Lưu dữ liệu thô (plain object) vào DB
                await DBService.saveData('products', [productData]);
            }
            return updatedInstance;
        }
        return null;
    }

    /**
     * Xóa một sản phẩm.
     * @param {string} productId - ID của sản phẩm cần xóa.
     */
    async deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        await DBService.deleteData('products', productId);
    }
}

