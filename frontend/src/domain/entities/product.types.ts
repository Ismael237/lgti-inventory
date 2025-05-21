import type { DirectusMetadata } from '@types';
import { z } from '@i18n';
import type { Category } from './category.types';

/**
 * Base interface for Product
 */
export interface ProductBase extends DirectusMetadata {
  id: number;
  reference: string;
  description: string | null;
  part_number: number | null;
  unit_price_eur: number;
  category_id: Category | null;
}

/**
 * Extended interface for frontend use
 */
export interface Product extends ProductBase {
  current_stock?: number; // Calculated from movements
}

/**
 * Interface specific for API responses
 */
export type ProductApiItem = ProductBase & {
    
};

/**
 * Schema for Product validation
 */
export const productSchema = z.object({
  reference: z.string().min(1, { message: 'validation.product.reference_required' }),
  description: z.string().nullable(),
  part_number: z.coerce.number({ message: 'validation.product.part_number_numeric' }),
  unit_price_eur: z.coerce.number().positive({ message: 'validation.product.price_positive' }),
  category_id: z.coerce.number().int().array(),
});

export type ProductDTOForm = z.infer<typeof productSchema>;

export type ProductDTO = {
  reference: string,
  description: string | null,
  part_number: number | null,
  unit_price_eur: number,
  category_id: number | null,
};

export enum ProductViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  EXPORT = 'export',
  SNAPSHOTS = 'snapshots',
  SNAPSHOT_DETAILS = 'snapshot_details',
  SNAPSHOT_CREATE = 'snapshot_create',
  SNAPSHOT_EXPORT = 'snapshot_export'
}