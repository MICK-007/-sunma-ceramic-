import { z } from 'zod';

// Whitelisted icons for Why Choose SUNMA section
export const ALLOWED_ICONS = [
  'ShieldCheck',
  'Globe2',
  'Layers',
  'Gem',
  'Building2',
  'Sparkles',
  'Award',
  'CheckCircle',
  'Truck',
  'Compass',
  'Maximize2',
  'Palette',
] as const;

// 1. CMS Page Slug Params Schema
export const cmsSlugParamSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

// 2. CMS Section ID Params Schema
export const cmsSectionIdParamSchema = z.object({
  id: z.string().uuid('Invalid section UUID format'),
});

// 3. CMS Item ID Params Schema
export const cmsItemIdParamSchema = z.object({
  id: z.string().uuid('Invalid item UUID format'),
});

// 4. Update Section Schema
export const updateCmsSectionSchema = z.object({
  title: z.string().max(255).optional(),
  subtitle: z.string().optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
}).strict(); // strict() prevents mass assignment of arbitrary fields

// 5. Reorder Sections Schema
export const reorderCmsSectionsSchema = z.object({
  pageSlug: z.string().min(1).max(100),
  sectionOrders: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int().min(0),
    })
  ).min(1, 'At least one section order must be provided'),
}).strict();

// Helper validation for external image URLs (only http and https allowed, max 2048 chars)
const externalImageUrlSchema = z
  .string()
  .trim()
  .max(2048, 'External image URL must contain at most 2048 characters')
  .url('Invalid URL format')
  .refine(url => /^https?:\/\//i.test(url), 'Only http:// and https:// image URLs are allowed')
  .optional()
  .nullable();

// 6. Create Section Item Schema
export const createCmsItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  iconName: z.enum(ALLOWED_ICONS).optional().nullable(),
  linkUrl: z.string().max(1000).optional().nullable(),
  linkLabel: z.string().max(100).optional().nullable(),
  mediaId: z.string().uuid().optional().nullable(),
  customImageUrl: externalImageUrlSchema,
  badgeTag: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isEnabled: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional(),
}).strict();

// 7. Update Section Item Schema
export const updateCmsItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  iconName: z.enum(ALLOWED_ICONS).optional().nullable(),
  linkUrl: z.string().max(1000).optional().nullable(),
  linkLabel: z.string().max(100).optional().nullable(),
  mediaId: z.string().uuid().optional().nullable(),
  customImageUrl: externalImageUrlSchema,
  badgeTag: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isEnabled: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
}).strict();

// 8. Rollback Version Schema
export const rollbackCmsVersionSchema = z.object({
  versionNumber: z.number().int().min(1),
}).strict();
