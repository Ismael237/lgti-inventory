import type { DirectusMetadata } from '@types';
import { z } from '@i18n';

/**
 * Base interface for Category
 */
export interface CategoryBase extends DirectusMetadata {
  id: number;
  name: string;
  parent_id: CategoryBase | null;
}

/**
 * Extended interface for frontend use
 */
export interface Category extends CategoryBase {
  children?: Category[];
  parent?: Category | null;
}

/**
 * Interface specific for API responses
 */
export type CategoryApiItem = CategoryBase & {
  parent_id: CategoryBase | null;
}

export type CategoryDTO = {
  name: string;
  parent_id: number | null;
}

/**
 * Schema for Category validation
 */
export const categorySchema = z.object({
  name: z.string().min(1, { message: 'validation.category.name_required' }),
  parent_id: z.number().int().nullable().array().optional(),
});

export type CategoryDTOForm = z.infer<typeof categorySchema>;

/**
 * Schema for updating a Category
 */
export const categoryUpdateSchema = z.object({
  name: z.string().min(1, { message: 'validation.category.name_required' }).optional(),
  parent_id: z.number().int().nullable().array().optional(),
});

export type CategoryUpdateDTO = z.infer<typeof categoryUpdateSchema>;

/**
 * Enum for Category view types
 */
export enum CategoryViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  HIERARCHY = 'hierarchy',
  HIERARCHY_SPECIFIC = 'hierarchy_specific',
  EXPORT = 'export'
}