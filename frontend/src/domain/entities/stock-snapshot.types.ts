import { z } from '@i18n';
import type { SnapshotEvent } from './snapshot-event.types';
import type { Product } from './product.types';

/**
 * Base interface for StockSnapshot
 */
export interface StockSnapshotBase {
  id: number;
  snapshot_event_id: SnapshotEvent;
  product_id: Product;
  quantity: number;
  unit_price_eur: number;
}

/**
 * Extended interface for frontend use
 */
export interface StockSnapshot extends StockSnapshotBase {
  snapshot_event?: {
    id: number;
    label: string;
    date_created: string;
  };
  product?: {
    id: number;
    reference: string;
  };
  total_value?: number; // Calculated field: quantity * unit_price_eur
}

/**
 * Type specific for API responses
 */
export type StockSnapshotApiItem = StockSnapshotBase & {
  // Additional properties specific to the API response if needed
}

/**
 * Schema for StockSnapshot validation
 */
export const stockSnapshotSchema = z.object({
  snapshot_event_id: z.number().int().positive('L\'événement de snapshot est requis'),
  product_id: z.number().int().positive('Le produit est requis'),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  unit_price_eur: z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
});

export type StockSnapshotDTO = z.infer<typeof stockSnapshotSchema>;

/**
 * Schema for updating a StockSnapshot
 */
export const stockSnapshotUpdateSchema = z.object({
  snapshot_event_id: z.number().int().positive('L\'événement de snapshot est requis').optional(),
  product_id: z.number().int().positive('Le produit est requis').optional(),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative').optional(),
  unit_price_eur: z.number().min(0, 'Le prix unitaire ne peut pas être négatif').optional(),
});

export type StockSnapshotUpdateDTO = z.infer<typeof stockSnapshotUpdateSchema>;

/**
 * Schema for bulk creation of StockSnapshots
 */
export const bulkStockSnapshotSchema = z.object({
  snapshot_event_id: z.number().int().positive('L\'événement de snapshot est requis'),
  items: z.array(
    z.object({
      product_id: z.number().int().positive('Le produit est requis'),
      quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
      unit_price_eur: z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
    })
  ).min(1, 'Au moins un produit est requis'),
});

export type BulkStockSnapshotDTO = z.infer<typeof bulkStockSnapshotSchema>;
