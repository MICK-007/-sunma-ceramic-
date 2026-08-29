import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Username or email is required.' })
    .min(1, 'Username or email cannot be empty.')
    .max(255, 'Identifier length must not exceed 255 characters.')
    .trim(),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password cannot be empty.')
    .max(100, 'Password length must not exceed 100 characters.'),
});

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email address format.')
    .max(255, 'Email must not exceed 255 characters.')
    .toLowerCase()
    .trim(),
  username: z
    .string({ required_error: 'Username is required.' })
    .min(3, 'Username must be at least 3 characters.')
    .max(100, 'Username must not exceed 100 characters.')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, underscores, hyphens, and dots.')
    .trim(),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(100, 'Password must not exceed 100 characters.'),
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .min(2, 'Full name must be at least 2 characters.')
    .max(255, 'Full name must not exceed 255 characters.')
    .trim(),
  phone: z
    .string()
    .max(50, 'Phone number must not exceed 50 characters.')
    .optional(),
});
