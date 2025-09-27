import { Product } from './Product.js';
import { ProductType } from '../constants.js';

export class Food extends Product {
    constructor(name, price, imageURL, isVegetarian) {
        super(name, price, imageURL, ProductType.FOOD);
        this.isVegetarian = isVegetarian;
    }
}