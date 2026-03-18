import { z } from 'zod';

// ---------------------------------------------------------------------------
// Registration schema
// ---------------------------------------------------------------------------
export const registerSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  // Don't over-validate on login — just require non-empty
  password: z.string().min(1, { message: 'Please enter your password.' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Reset password schema
// ---------------------------------------------------------------------------
export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
