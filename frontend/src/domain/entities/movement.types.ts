import { z } from 'zod';
import type { Product } from './product.types';
import type { DirectusMetadata } from '@types';

/**
 * Enum for Movement Type
 */
export enum MovementType {
  IN = 'IN',
  OUT = 'OUT'
}

/**
 * Base interface for Movement
 */
export interface MovementBase extends DirectusMetadata {
  id: number;
  type: MovementType;
  quantity: number;
  product_id: Product;
  notes: string | null;
}

/**
 * Extended interface for frontend use
 */
export type Movement = MovementBase & {
  
}

/**
 * Type specific for API responses
 */
export type MovementApiItem = MovementBase & {
  // Additional properties specific to the API response if needed
}

export interface MovementSummary {
  product_id: number;
  total_in: number;
  total_out: number;
  current_stock: number;
  average_price: number;
}

/**
 * Schema for Movement validation
 */
export const movementSchema = z.object({
  type: z.nativeEnum(MovementType, {
    errorMap: () => ({ message: 'validation.movement.type_required' })
  }).array(),
  quantity: z.number().min(1, { message: 'validation.movement.quantity_positive' }),
  product_id: z.number().int().positive({ message: 'validation.movement.product_required' }).array(),
  notes: z.string().nullable(),
});

export type MovementDTOForm = z.infer<typeof movementSchema>;

export type MovementDTO = {
  type: MovementType,
  quantity: number,
  product_id: number,
  notes: string | null,
};

export enum MovementViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  EXPORT = 'export'
}