import type { DirectusMetadata } from '@types';

/**
 * Base interface for PartnerType
 */
export interface PartnerType extends DirectusMetadata {
  id: number;
  type_name: string;
}
