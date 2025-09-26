// managers/OrderManager.js
import { AuthorizationException, ValidationException } from '../exceptions.js';
import { OrderType } from '../constants.js';
import { Customer} from '../classes/Customer.js';
import { Admin } from '../classes/Admin.js';
import { RegularOrder} from '../classes/RegularOrder.js';
import { ExpressOrder } from '../classes/ExpressOrder.js';

export class OrderManager {
    constructor(userManager, productManager, cartManager) {
        this.orders = new Map();
        this.userManager = userManager;
        this.productManager = productManager;
        this.cartManager = cartManager;
    }

    createOrder(orderType, orderData, sessionToken) {
        const user = this.userManager.getCurrentUser(sessionToken);
        if (!(user instanceof Customer)) {
            throw new AuthorizationException("Only customers can create orders");
        }

        const cartItems = this.cartManager.getCart(sessionToken);
        if (cartItems.length === 0) {
            throw new ValidationException("Cart is empty");
        }

        let order;
        if (orderType === OrderType.REGULAR_ORDER) {
            order = new RegularOrder(user.id, cartItems, orderData.deliveryAddress);
        } else {
            order = new ExpressOrder(user.id, cartItems, orderData.pickupLocation);
        }

        this.orders.set(order.id, order);
        user.addOrderToHistory(order.id);
        this.cartManager.clearCart(user.id);

        return order;
    }

    getOrderById(orderId, sessionToken) {
        const user = this.userManager.getCurrentUser(sessionToken);
        if (!user) {
            throw new AuthorizationException("User not authenticated");
        }

        const order = this.orders.get(orderId);
        if (!order) {
            throw new ValidationException("Order not found");
        }

        if (!user.canAccessOrder(order.id)) {
            throw new AuthorizationException("You don't have permission to view this order");
        }

        return order;
    }

    getAllOrders(sessionToken) {
        const user = this.userManager.getCurrentUser(sessionToken);
        if (!user) {
            throw new AuthorizationException("User not authenticated");
        }

        if (user instanceof Admin) {
            return Array.from(this.orders.values());
        } else {
            return Array.from(this.orders.values()).filter(order => 
                user.canAccessOrder(order.id)
            );
        }
    }

    updateOrderStatus(orderId, newStatus, sessionToken) {
        if (!this.userManager.isAdmin(sessionToken)) {
            throw new AuthorizationException("Only admin can update order status");
        }

        const order = this.orders.get(orderId);
        if (!order) {
            throw new ValidationException("Order not found");
        }

        order.updateStatus(newStatus);
        return order;
    }
}