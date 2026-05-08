import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name is too short'),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters'),

  email: z
    .string()
    .email('Invalid email address'),

  phone: z
    .string()
    .min(10, 'Invalid phone number'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),

  role: z.enum(['GUEST', 'HOST']),

  bio: z.string().optional(),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
