import Product from './Product.js';
import { ProductType } from '../constants.js';

export default class Drink extends Product {
    constructor(name, description, price, size, isHot) {
        super(name, description, price, ProductType.DRINK);
        this.size = size;
        this.isHot = isHot;
    }
}
