import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.').max(255).trim(),
  nameTh: z.string().max(255).optional(),
  productCode: z.string().min(1, 'Product code is required.').max(100).trim(),
  slug: z.string().max(255).optional(),
  description: z.string().max(5000).optional(), // Rich-text description allowed up to 5000 chars
  descriptionTh: z.string().max(5000).optional(),
  shortDescription: z.string().max(1000).optional(),
  shortDescriptionTh: z.string().max(1000).optional(),
  categoryId: z.string().min(1, 'Category ID is required.').max(100),
  brandId: z.string().max(100).optional(),
  thumbnail: z.string().url('Invalid thumbnail URL format.').or(z.string().max(500)).optional(),
  images: z.array(z.string()).optional(),
  size: z.string().max(50).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  material: z.string().max(100).optional(),
  surface: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  pattern: z.string().max(100).optional(),
  indoorOutdoor: z.string().max(50).optional(),
  countryOfOrigin: z.string().max(100).optional(),
  piecesPerBox: z.number().int().positive('Pieces per box must be positive.').optional(),
  coveragePerBox: z.number().positive('Coverage per box must be positive.').optional(),
  weightPerBox: z.number().positive('Weight per box must be positive.').optional(),
  pricePerPiece: z.number().positive('Price per piece must be greater than 0.'),
  pricePerBox: z.number().positive().optional(),
  stockPieces: z.number().int().min(0, 'Stock pieces cannot be negative.').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
