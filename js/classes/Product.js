/**
 * LỚP CHA - Product: Lớp cơ sở cho tất cả các sản phẩm.
 * Đây là một lớp trừu tượng và không nên được khởi tạo trực tiếp.
 */
export default class Product {
    /**
     * @param {string} id - ID sản phẩm.
     * @param {string} name - Tên sản phẩm.
     * @param {number} price - Giá sản phẩm.
     * @param {string} description - Mô tả.
     * @param {string} imageUrl - URL hình ảnh.
     * @param {'drink' | 'food'} type - Loại sản phẩm.
     */
    constructor(id, name, price, description, imageUrl, type) {
        if (this.constructor === Product) {
            throw new Error("Cannot instantiate abstract class Product directly.");
        }
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.type = type;
    }
}

