import { z, ZodType } from 'zod';

// const statusEnum = ['ACCEPTED', 'REJECTED', 'PENDING'] as const;

export class FollowValidation {
  static readonly FOLLOW: ZodType = z.object({
    id: z.coerce.number(),
  });

  static readonly STATUS: ZodType = z.object({
    id: z.coerce.number(),
  });
}
