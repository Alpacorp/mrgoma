import * as z from 'zod';

export const LoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Enter your username')
    .refine(val => val.length > 0, { message: 'Enter your username' }),
  password: z.string().trim().nonempty('Enter your password'),
});

export type Inputs = z.infer<typeof LoginSchema>;
