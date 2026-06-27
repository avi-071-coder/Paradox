import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
});

export const scenarioSchema = z.object({
  scenario: z.string().min(5, 'Scenario must be at least 5 characters').max(500, 'Scenario cannot exceed 500 characters').transform((val) => val.trim()),
});
