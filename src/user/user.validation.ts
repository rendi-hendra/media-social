import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(3).max(20),
    name: z.string().min(3).max(30),
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(3).max(20),
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
  });

  static readonly DELETE: ZodType = z.object({
    password: z.string().min(3).max(100),
  });
}
