"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z
        .string({ required_error: 'Product ID is required.' })
        .min(1, 'Product ID cannot be empty.')
        .max(100, 'Product ID length invalid.')
        .trim(),
    quantity: zod_1.z
        .number({ required_error: 'Quantity must be a number.' })
        .int('Quantity must be an integer.')
        .min(1, 'Quantity must be at least 1.')
        .max(1000, 'Quantity cannot exceed 1000 pieces per request.')
        .default(1),
    variantId: zod_1.z.string().max(100).optional(),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z
        .number({ required_error: 'Quantity must be a number.' })
        .int('Quantity must be an integer.')
        .min(0, 'Quantity cannot be negative.')
        .max(1000, 'Quantity cannot exceed 1000 pieces per request.'),
});
