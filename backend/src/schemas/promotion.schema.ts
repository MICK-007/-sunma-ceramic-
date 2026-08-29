import { z } from 'zod';

export const createPromotionSchema = z.object({
  code: z.string().max(50).trim().optional(),
  title: z.string().min(1, 'Title is required.').max(255).trim().optional(),
  name: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  minQuantity: z.number().int().min(1).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();
