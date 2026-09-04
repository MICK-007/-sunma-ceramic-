import { z } from 'zod';

export const mediaIdParamSchema = z.object({
  id: z.string().uuid('Invalid media UUID format'),
});

export const updateCmsMediaSchema = z.object({
  altText: z.string().max(255).optional(),
}).strict();
