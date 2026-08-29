import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z
    .string({ required_error: 'Product ID is required.' })
    .min(1, 'Product ID cannot be empty.')
    .max(100, 'Product ID length invalid.')
    .trim(),
  quantity: z
    .number({ required_error: 'Quantity must be a number.' })
    .int('Quantity must be an integer.')
    .min(1, 'Quantity must be at least 1.')
    .max(1000, 'Quantity cannot exceed 1000 pieces per request.')
    .default(1),
  variantId: z.string().max(100).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity must be a number.' })
    .int('Quantity must be an integer.')
    .min(0, 'Quantity cannot be negative.')
    .max(1000, 'Quantity cannot exceed 1000 pieces per request.'),
});
