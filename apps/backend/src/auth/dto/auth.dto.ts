import { z } from 'zod';
import { roleSchema } from '../../database/schemas/users.schema';

export const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: roleSchema.optional(),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authResponseDto = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: roleSchema,
  }),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type AuthResponseDto = z.infer<typeof authResponseDto>;
