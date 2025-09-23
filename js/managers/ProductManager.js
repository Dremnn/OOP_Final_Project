import Product from '../classes/Product.js';
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
     * Tải sản phẩm theo chiến lược "Cache First".
     * @returns {Promise<Array<Product>>} - Mảng các đối tượng Product.
     */
    async loadProducts() {
        try {
            // 1. Thử lấy dữ liệu từ IndexedDB (cache) trước.
            let productsData = await DBService.getAllData('products');
            
            // 2. Nếu cache rỗng, gọi API để lấy dữ liệu mới.
            if (!productsData || productsData.length === 0) {
                productsData = await ApiService.getProducts();
                // 3. Lưu dữ liệu mới từ API vào cache cho lần sau.
                await DBService.saveData('products', productsData);
            }
            
            // 4. Chuyển đổi dữ liệu thô thành các đối tượng Product.
            this.products = productsData.map(p => new Product(p.id, p.name, p.price, p.desc, p.img));
            return this.products;
        } catch (error) {
            console.error("Không thể tải sản phẩm:", error);
            return []; // Trả về mảng rỗng nếu có lỗi để ứng dụng không bị crash.
        }
    }

    /**
     * Tìm một sản phẩm trong danh sách đã tải bằng ID.
     * @param {string} id - ID của sản phẩm.
     * @returns {Product | undefined} - Trả về sản phẩm nếu tìm thấy.
     */
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
}

