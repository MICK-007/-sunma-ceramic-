"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionSchema = exports.createPromotionSchema = void 0;
const zod_1 = require("zod");
exports.createPromotionSchema = zod_1.z.object({
    code: zod_1.z.string().max(50).trim().optional(),
    title: zod_1.z.string().min(1, 'Title is required.').max(255).trim().optional(),
    name: zod_1.z.string().max(255).optional(),
    description: zod_1.z.string().max(2000).optional(),
    discountPercentage: zod_1.z.number().min(0).max(100).optional(),
    discountAmount: zod_1.z.number().min(0).optional(),
    minPurchaseAmount: zod_1.z.number().min(0).optional(),
    maxDiscountAmount: zod_1.z.number().min(0).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    minQuantity: zod_1.z.number().int().min(1).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updatePromotionSchema = exports.createPromotionSchema.partial();
