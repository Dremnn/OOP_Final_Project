import Product from './Product.js';
import { ProductType } from '../constants.js';

export default class Food extends Product {
    constructor(name, description, price, isVegetarian) {
        super(name, description, price, ProductType.FOOD);
        this.isVegetarian = isVegetarian;
    }
}
