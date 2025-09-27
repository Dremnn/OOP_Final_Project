// Constants and Enums
export const UserRole = {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN'
};

export const OrderStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

export const ProductType = {
    DRINK: 'DRINK',
    FOOD: 'FOOD'
};

export const OrderType = {
    REGULAR_ORDER: 'REGULAR_ORDER',
    EXPRESS_ORDER: 'EXPRESS_ORDER'
};

export const SizeMultipliers = {
    S: { multiplier: 0.8, label: 'Small' },
    M: { multiplier: 1.0, label: 'Medium' },
    L: { multiplier: 1.3, label: 'Large' }
};