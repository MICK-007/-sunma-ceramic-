"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const shippingAddressSchema = zod_1.z.object({
    recipientName: zod_1.z.string().min(1, 'Recipient name is required.').max(255).trim(),
    phone: zod_1.z.string().min(1, 'Phone number is required.').max(50).trim(),
    addressLine: zod_1.z.string().min(1, 'Address line is required.').max(500).trim(),
    subdistrict: zod_1.z.string().max(100).optional(),
    district: zod_1.z.string().max(100).optional(),
    province: zod_1.z.string().max(100).optional(),
    postalCode: zod_1.z.string().max(20).optional(),
});
const taxInvoiceDetailsSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1).max(255).trim(),
    taxId: zod_1.z.string().min(1).max(50).trim(),
    branch: zod_1.z.string().max(100).optional(),
    address: zod_1.z.string().min(1).max(500).trim(),
}).optional();
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1).max(100).trim(),
        quantity: zod_1.z.number().int().min(1).max(1000),
    }))
        .min(1, 'Order items cannot be empty.')
        .max(100, 'Cannot order more than 100 distinct items per order.'),
    shippingAddress: shippingAddressSchema,
    paymentMethod: zod_1.z.enum(['Bank Transfer', 'PromptPay QR', 'Credit Card'], {
        errorMap: () => ({ message: 'Invalid payment method selected.' }),
    }),
    taxInvoiceRequested: zod_1.z.boolean().optional(),
    taxInvoiceDetails: taxInvoiceDetailsSchema,
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Pending', 'Confirmed', 'Preparing', 'Cancelled'], {
        errorMap: () => ({ message: 'Invalid order status value.' }),
    }),
});
