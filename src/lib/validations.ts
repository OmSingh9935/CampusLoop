import { z } from 'zod'

// ============================================================
// Email Validation
// ============================================================

/**
 * Strict @kiet.edu email validator.
 * Rejects lookalikes like x@kiet.edu.fake.com or x@notkiet.edu
 */
const KIET_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@kiet\.edu$/i

export const kietEmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .refine(
    (email) => KIET_EMAIL_REGEX.test(email),
    'Only @kiet.edu email addresses are allowed'
  )

// ============================================================
// Auth Schemas
// ============================================================

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name too long')
      .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),
    email: kietEmailSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'teacher'] as const, {
      errorMap: () => ({ message: 'Select a role' }),
    }),
    department: z.string().max(100).optional(),
    year: z
      .string()
      .optional()
      .refine(
        (v) => !v || (Number(v) >= 1 && Number(v) <= 6),
        'Year must be between 1 and 6'
      ),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const loginSchema = z.object({
  email: kietEmailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: kietEmailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

// ============================================================
// Profile Schemas
// ============================================================

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(300, 'Bio too long').optional(),
  department: z.string().max(100).optional(),
  year: z.number().min(1).max(6).optional(),
})

// ============================================================
// Message Schemas
// ============================================================

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long (max 5000 characters)')
    .transform((s) => s.trim()),
  tag: z.enum(['question', 'answer', 'resource', 'opportunity', 'announcement', 'general'] as const),
  reply_to_id: z.string().uuid().nullable().optional(),
  attachment_url: z.string().url().nullable().optional(),
  attachment_name: z.string().max(255).nullable().optional(),
  attachment_type: z.enum(['image', 'pdf', 'file', 'link'] as const).nullable().optional(),
  attachment_size: z.number().max(10 * 1024 * 1024).nullable().optional(), // 10MB max
})

// ============================================================
// Report Schema
// ============================================================

export const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'misinformation', 'harassment', 'other'] as const),
  details: z.string().max(500).optional(),
})

// ============================================================
// Search Schema
// ============================================================

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  group_id: z.string().uuid().optional(),
  tag: z.enum(['question', 'answer', 'resource', 'opportunity', 'announcement', 'general'] as const).optional(),
  role: z.enum(['student', 'teacher', 'admin'] as const).optional(),
  answered: z.boolean().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
})

// ============================================================
// Admin Schemas
// ============================================================

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  rules: z.string().max(2000).optional(),
  icon: z.string().max(8).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  sort_order: z.number().min(0).optional(),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type ReportFormData = z.infer<typeof reportSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type GroupCreateFormData = z.infer<typeof groupCreateSchema>
