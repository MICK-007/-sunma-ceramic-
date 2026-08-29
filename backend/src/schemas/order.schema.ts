import { z } from 'zod';

const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required.').max(255).trim(),
  phone: z.string().min(1, 'Phone number is required.').max(50).trim(),
  addressLine: z.string().min(1, 'Address line is required.').max(500).trim(),
  subdistrict: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

const taxInvoiceDetailsSchema = z.object({
  companyName: z.string().min(1).max(255).trim(),
  taxId: z.string().min(1).max(50).trim(),
  branch: z.string().max(100).optional(),
  address: z.string().min(1).max(500).trim(),
}).optional();

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100).trim(),
        quantity: z.number().int().min(1).max(1000),
      })
    )
    .min(1, 'Order items cannot be empty.')
    .max(100, 'Cannot order more than 100 distinct items per order.'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['Bank Transfer', 'PromptPay QR', 'Credit Card'], {
    errorMap: () => ({ message: 'Invalid payment method selected.' }),
  }),
  taxInvoiceRequested: z.boolean().optional(),
  taxInvoiceDetails: taxInvoiceDetailsSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Preparing', 'Cancelled'], {
    errorMap: () => ({ message: 'Invalid order status value.' }),
  }),
});
