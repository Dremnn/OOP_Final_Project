import { Product } from './Product.js';
import { ProductType } from '../constants.js';

export class Drink extends Product {
    constructor(name, description, price, imageURL, size, isHot) {
        super(name, description, price, imageURL, ProductType.DRINK);
        this.size = size;
        this.isHot = isHot;
        this.availableAddons = [];
    }
}