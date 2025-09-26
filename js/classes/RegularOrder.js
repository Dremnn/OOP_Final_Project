import { Order } from './Order.js';
import { OrderType } from '../constants.js';

export class RegularOrder extends Order {
    constructor(customerId, items, deliveryAddress) {
        super(customerId, items, OrderType.REGULAR_ORDER);
        this.deliveryAddress = deliveryAddress;
        this.requestedDeliveryTime = null;
    }

    getDeliveryFee() {
        return 25000;
    }

    getEstimatedPreparationTime() {
        return 30;
    }
}