import Product from './Product.js';

/**
 * LỚP CON - Food: Kế thừa từ Product.
 * Đại diện cho một món ăn, có thêm thuộc tính isVegetarian.
 */
export default class Food extends Product {
    /**
     * @param {string} id
     * @param {string} name
     * @param {number} price
     * @param {string} description
     * @param {string} imageUrl
     * @param {boolean} [isVegetarian=false] - Món này có phải món chay không.
     */
    constructor(id, name, price, description, imageUrl, isVegetarian = false) {
        // Gọi constructor của lớp cha Product với type là 'food'
        super(id, name, price, description, imageUrl, 'food');

        // Thêm thuộc tính riêng của Food
        this.isVegetarian = isVegetarian;
    }
}
