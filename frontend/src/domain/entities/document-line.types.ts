// Inspiré de @[frontend/src/domain/entities/product.types.ts]
import type { DirectusMetadata } from '@types';
import { z } from '@i18n';
import type { Document } from './document.types';

/**
 * Base interface for DocumentLine
 */
export interface DocumentLineBase extends DirectusMetadata {
  id: number;
  document_id: number;
  designation: string;
  reference: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Extended interface for frontend use
 */
export interface DocumentLine extends DocumentLineBase {
  document?: Document; // Related document
}

/**
 * Interface specific for API responses
 */
export type DocumentLineApiItem = DocumentLineBase & {
  // Additional fields from API if needed
};

/**
 * Schema for DocumentLine validation
 */
export const documentLineSchema = z.object({
  document_id: z.coerce.number().int().positive({ message: 'validation.document_line.document_id_required' }),
  designation: z.string().min(1, { message: 'validation.document_line.designation_required' }),
  reference: z.string().nullable(),
  quantity: z.coerce.number().positive({ message: 'validation.document_line.quantity_positive' }),
  unit_price: z.coerce.number().nonnegative({ message: 'validation.document_line.unit_price_nonnegative' }),
  total_price: z.coerce.number().nonnegative({ message: 'validation.document_line.total_price_nonnegative' }),
});

export type DocumentLineDTOForm = z.infer<typeof documentLineSchema>;

export type DocumentLineDTO = {
  document_id?: number;
  designation: string;
  reference: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};
