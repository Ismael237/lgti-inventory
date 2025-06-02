// Inspiré de @[frontend/src/domain/entities/product.types.ts]
import type { DirectusMetadata } from '@types';
import { z } from '@i18n';
import type { DocumentLine, DocumentLineDTO } from './document-line.types';

export enum DocumentType {
  INVOICE = 'INVOICE',
  ESTIMATE = 'ESTIMATE'
}

/**
 * Base interface for Document
 */
export interface DocumentBase extends DirectusMetadata {
  id: number;
  type: DocumentType;
  reference: string;
  client_name: string;
  client_address: string | null;
  client_phone: string | null;
  client_niu: string | null;
  client_rc: string | null;
  notes: string | null;
  total_ht: number;
  amount_words: string | null;
  date_document: string; // ISO date string
  document_line: DocumentLine[];
}

/**
 * Extended interface for frontend use
 */
export interface Document extends DocumentBase {
  lines?: DocumentLine[]; // Related document lines
}

/**
 * Interface specific for API responses
 */
export type DocumentApiItem = DocumentBase & {
  // Additional fields from API if needed
};

/**
 * Schema for Document validation
 */
export const documentSchema = z.object({
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'validation.document.type_required' })
  }).array(),
  reference: z.string().min(1, { message: 'validation.document.reference_required' }),
  client_name: z.string().min(1, { message: 'validation.document.client_name_required' }),
  client_address: z.string().nullable(),
  client_phone: z.string().nullable(),
  client_niu: z.string().nullable(),
  client_rc: z.string().nullable(),
  notes: z.string().nullable(),
  total_ht: z.coerce.number().nonnegative({ message: 'validation.document.total_ht_nonnegative' }),
  amount_words: z.string().nullable(),
  date_document: z.string().min(1, { message: 'validation.document.date_required' }),
});

export type DocumentDTOForm = z.infer<typeof documentSchema>;

export type DocumentDTO = {
  type: DocumentType;
  reference: string;
  client_name: string;
  client_address: string | null;
  client_phone: string | null;
  client_niu: string | null;
  client_rc: string | null;
  notes: string | null;
  total_ht: number;
  amount_words: string | null;
  date_document: string; // ISO date string
  document_line: DocumentLineDTO[];
};

export enum DocumentViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  EXPORT = 'export',
  PRINT = 'print'
}
