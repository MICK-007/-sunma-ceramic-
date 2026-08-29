import { z } from 'zod';

export const loginSchema = z
  .object({
    identifier: z.string().max(255).trim().optional(),
    email: z.string().max(255).trim().optional(),
    username: z.string().max(255).trim().optional(),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(1, 'Password cannot be empty.')
      .max(100, 'Password length must not exceed 100 characters.'),
  })
  .refine(data => data.identifier || data.email || data.username, {
    message: 'Username or email is required.',
    path: ['identifier'],
  });

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email address format.')
    .max(255, 'Email must not exceed 255 characters.')
    .toLowerCase()
    .trim(),
  username: z
    .string()
    .max(100, 'Username must not exceed 100 characters.')
    .optional()
    .or(z.literal(''))
    .nullable(),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters long.')
    .max(100, 'Password must not exceed 100 characters.'),
  fullName: z
    .string()
    .max(255, 'Full name must not exceed 255 characters.')
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone: z
    .string()
    .max(50, 'Phone number must not exceed 50 characters.')
    .optional()
    .or(z.literal(''))
    .nullable(),
});
