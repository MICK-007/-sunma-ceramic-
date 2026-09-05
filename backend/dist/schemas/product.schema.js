"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name must be at least 2 characters.').max(255).trim(),
    nameTh: zod_1.z.string().max(255).optional(),
    productCode: zod_1.z.string().min(1, 'Product code is required.').max(100).trim(),
    slug: zod_1.z.string().max(255).optional(),
    description: zod_1.z.string().max(5000).optional(), // Rich-text description allowed up to 5000 chars
    descriptionTh: zod_1.z.string().max(5000).optional(),
    shortDescription: zod_1.z.string().max(1000).optional(),
    shortDescriptionTh: zod_1.z.string().max(1000).optional(),
    categoryId: zod_1.z.string().min(1, 'Category ID is required.').max(100),
    brandId: zod_1.z.string().max(100).optional(),
    thumbnail: zod_1.z.string().url('Invalid thumbnail URL format.').or(zod_1.z.string().max(500)).optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    size: zod_1.z.string().max(50).optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    thickness: zod_1.z.number().positive().optional(),
    material: zod_1.z.string().max(100).optional(),
    surface: zod_1.z.string().max(100).optional(),
    color: zod_1.z.string().max(100).optional(),
    pattern: zod_1.z.string().max(100).optional(),
    indoorOutdoor: zod_1.z.string().max(50).optional(),
    countryOfOrigin: zod_1.z.string().max(100).optional(),
    piecesPerBox: zod_1.z.number().int().positive('Pieces per box must be positive.').optional(),
    coveragePerBox: zod_1.z.number().positive('Coverage per box must be positive.').optional(),
    weightPerBox: zod_1.z.number().positive('Weight per box must be positive.').optional(),
    pricePerPiece: zod_1.z.number().positive('Price per piece must be greater than 0.'),
    pricePerBox: zod_1.z.number().positive().optional(),
    stockPieces: zod_1.z.number().int().min(0, 'Stock pieces cannot be negative.').optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    featured: zod_1.z.boolean().optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
