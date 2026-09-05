"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollbackCmsVersionSchema = exports.updateCmsItemSchema = exports.createCmsItemSchema = exports.reorderCmsSectionsSchema = exports.updateCmsSectionSchema = exports.cmsItemIdParamSchema = exports.cmsSectionIdParamSchema = exports.cmsSlugParamSchema = exports.ALLOWED_ICONS = void 0;
const zod_1 = require("zod");
// Whitelisted icons for Why Choose SUNMA section
exports.ALLOWED_ICONS = [
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
];
// 1. CMS Page Slug Params Schema
exports.cmsSlugParamSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});
// 2. CMS Section ID Params Schema
exports.cmsSectionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid section UUID format'),
});
// 3. CMS Item ID Params Schema
exports.cmsItemIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid item UUID format'),
});
// 4. Update Section Schema
exports.updateCmsSectionSchema = zod_1.z.object({
    title: zod_1.z.string().max(255).optional(),
    subtitle: zod_1.z.string().optional(),
    isEnabled: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().int().min(0).optional(),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
}).strict(); // strict() prevents mass assignment of arbitrary fields
// 5. Reorder Sections Schema
exports.reorderCmsSectionsSchema = zod_1.z.object({
    pageSlug: zod_1.z.string().min(1).max(100),
    sectionOrders: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        sortOrder: zod_1.z.number().int().min(0),
    })).min(1, 'At least one section order must be provided'),
}).strict();
// Helper validation for image URLs (http, https, or relative paths like /api/cms/...)
const externalImageUrlSchema = zod_1.z
    .string()
    .trim()
    .max(2048, 'Image URL must contain at most 2048 characters')
    .refine(url => /^https?:\/\//i.test(url) || url.startsWith('/'), 'Only http://, https://, or relative paths (/...) are allowed')
    .optional()
    .nullable();
// 6. Create Section Item Schema
exports.createCmsItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(255),
    subtitle: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    iconName: zod_1.z.enum(exports.ALLOWED_ICONS).optional().nullable(),
    linkUrl: zod_1.z.string().max(1000).optional().nullable(),
    linkLabel: zod_1.z.string().max(100).optional().nullable(),
    mediaId: zod_1.z.string().uuid().optional().nullable(),
    customImageUrl: externalImageUrlSchema,
    badgeTag: zod_1.z.string().max(100).optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).optional().default(0),
    isEnabled: zod_1.z.boolean().optional().default(true),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
}).strict();
// 7. Update Section Item Schema
exports.updateCmsItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    subtitle: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    iconName: zod_1.z.enum(exports.ALLOWED_ICONS).optional().nullable(),
    linkUrl: zod_1.z.string().max(1000).optional().nullable(),
    linkLabel: zod_1.z.string().max(100).optional().nullable(),
    mediaId: zod_1.z.string().uuid().optional().nullable(),
    customImageUrl: externalImageUrlSchema,
    badgeTag: zod_1.z.string().max(100).optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).optional(),
    isEnabled: zod_1.z.boolean().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
}).strict();
// 8. Rollback Version Schema
exports.rollbackCmsVersionSchema = zod_1.z.object({
    versionNumber: zod_1.z.number().int().min(1),
}).strict();
