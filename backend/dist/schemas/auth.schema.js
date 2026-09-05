"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z
    .object({
    identifier: zod_1.z.string().max(255).trim().optional(),
    email: zod_1.z.string().max(255).trim().optional(),
    username: zod_1.z.string().max(255).trim().optional(),
    password: zod_1.z
        .string({ required_error: 'Password is required.' })
        .min(1, 'Password cannot be empty.')
        .max(100, 'Password length must not exceed 100 characters.'),
})
    .refine(data => data.identifier || data.email || data.username, {
    message: 'Username or email is required.',
    path: ['identifier'],
});
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string({ required_error: 'Username is required.' })
        .min(3, 'Username must be at least 3 characters long.')
        .max(100, 'Username must not exceed 100 characters.')
        .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, hyphens, and dots.')
        .toLowerCase()
        .trim(),
    email: zod_1.z
        .string({ required_error: 'Email is required.' })
        .email('Invalid email address format.')
        .max(255, 'Email must not exceed 255 characters.')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({ required_error: 'Password is required.' })
        .min(8, 'Password must be at least 8 characters long.')
        .max(100, 'Password must not exceed 100 characters.'),
    phone: zod_1.z
        .string()
        .max(50, 'Phone number must not exceed 50 characters.')
        .optional()
        .or(zod_1.z.literal(''))
        .nullable(),
});
