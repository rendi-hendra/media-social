import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(3).max(20),
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
  });

  static readonly DELETE: ZodType = z.object({
    password: z.string().min(3).max(100),
  });
}
