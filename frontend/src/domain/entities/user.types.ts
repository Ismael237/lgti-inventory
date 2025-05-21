import { z } from '@i18n';

/**
 * Schema for user login validation
 */
export const loginSchema = z.object({
  email: z.string().email('L\'adresse email est invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginDTO = z.infer<typeof loginSchema>;


/**
 * Schema for DirectusUser validation
 */
export const directusUserSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().email('L\'adresse email est invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').nullable(),
});

export type DirectusUserDTO = z.infer<typeof directusUserSchema>;

/**
 * Schema for updating a DirectusUser
 */
export const directusUserUpdateSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email: z.string().email('L\'adresse email est invalide').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').nullable().optional(),
});

export type DirectusUserUpdateDTO = z.infer<typeof directusUserUpdateSchema>;