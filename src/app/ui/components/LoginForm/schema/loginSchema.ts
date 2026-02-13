import * as z from 'zod';

export const LoginSchema = z.object({
  email: z
    .email('Enter a valid email')
    .trim()
    .toLowerCase()
    .refine(val => val.length > 0, { error: 'Enter an email ' }),
  password: z.string().trim().nonempty('Enter your password'),
});

export type Inputs = z.infer<typeof LoginSchema>;
