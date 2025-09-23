import Product from './Product.js';

/**
 * LỚP CON - Drink: Kế thừa từ Product.
 * Đại diện cho một món đồ uống, có thêm thuộc tính size.
 */
export default class Drink extends Product {
    /**
     * @param {string} id
     * @param {string} name
     * @param {number} price
     * @param {string} description
     * @param {string} imageUrl
     * @param {string} [size='S, M, L'] - Các kích cỡ có sẵn.
     */
    constructor(id, name, price, description, imageUrl, size = 'S, M, L') {
        // Gọi constructor của lớp cha Product với type là 'drink'
        super(id, name, price, description, imageUrl, 'drink');
        
        // Thêm thuộc tính riêng của Drink
        this.size = size;
    }
}
