import { z, ZodType } from 'zod';

const fileSizeLimit = 5 * 1024 * 1024; // 5MB

export class PostValidation {
  static readonly CREATED: ZodType = z.object({
    title: z.string().min(3).max(80),
    description: z.string().min(3).max(500),
    image: z
      .instanceof(File)
      .refine(
        (file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
        { message: 'Invalid image file type' },
      )
      .refine((file) => file.size <= fileSizeLimit)
      .optional(),
  });
  static readonly UPDATED: ZodType = z.object({
    title: z.string().min(3).max(80),
    description: z.string().min(3).max(500).optional(),
  });
}
