import type { DirectusUser } from '@directus/sdk';
import { z } from '@i18n';

/**
 * Base interface for SnapshotEvent
 */
export interface SnapshotEventBase {
  id: number;
  label: string;
  notes: string | null;
  user_created: DirectusUser | null; // ref to directus user id
  date_created: string;
}

/**
 * Extended interface for frontend use
 */
export interface SnapshotEvent extends SnapshotEventBase {
  user_created_info?: {
    first_name: string | null;
    last_name: string | null;
  };
}

/**
 * Type specific for API responses
 */
export type SnapshotEventApiItem = SnapshotEventBase &{
  // Additional properties specific to the API response if needed
}

/**
 * Schema for SnapshotEvent validation
 */
export const snapshotEventSchema = z.object({
  label: z.string().optional(),
  notes: z.string().optional(),
});

export type SnapshotEventDTOForm = z.infer<typeof snapshotEventSchema>;

export type SnapshotEventDTO = {
  label?: string,
  notes?: string,
}