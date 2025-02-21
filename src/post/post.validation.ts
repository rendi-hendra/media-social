import { z, ZodType } from 'zod';

export class PostValidation {
  static readonly CREATED: ZodType = z.object({
    title: z.string().min(3).max(80),
    description: z.string().min(3).max(500),
  });
  static readonly UPDATED: ZodType = z.object({
    title: z.string().min(3).max(80),
    description: z.string().min(3).max(500),
  });
}
