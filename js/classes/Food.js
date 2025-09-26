import { Product } from './Product.js';
import { ProductType } from '../constants.js';

export class Food extends Product {
    constructor(name, description, price, imageURL, isVegetarian) {
        super(name, description, price, imageURL, ProductType.FOOD);
        this.isVegetarian = isVegetarian;
    }
}