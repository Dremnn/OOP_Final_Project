import { Order } from './Order.js';
import { OrderType } from '../constants.js';

export class ExpressOrder extends Order {
    constructor(customerId, items, pickupLocation) {
        super(customerId, items, OrderType.EXPRESS_ORDER);
        this.pickupLocation = pickupLocation;
        this.isPriorityOrder = true;
    }

    getDeliveryFee() {
        return 50000;
    }

    getEstimatedPreparationTime() {
        return 15;
    }
}