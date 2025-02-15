import { z, ZodType } from 'zod';

export class FollowValidation {
  static readonly FOLLOW: ZodType = z.object({
    id: z.coerce.number(),
  });
}
