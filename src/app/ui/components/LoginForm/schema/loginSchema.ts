import * as z from 'zod';

export const LoginSchema = z.object({
  email: z
    .email('Ingresa un email válido')
    .trim()
    .toLowerCase()
    .refine(val => val.length > 0, { error: 'Ingresa un email ' }),
  password: z.string().trim().nonempty('Ingresa tu contraseña'),
});

export type Inputs = z.infer<typeof LoginSchema>;
