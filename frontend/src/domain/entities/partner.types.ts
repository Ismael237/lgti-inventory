import type { DirectusMetadata } from '@types';
import { z } from '@i18n';
import type { PartnerType } from './partner-type.types';

type PartnerTypeItem = {
  partner_type_id: PartnerType;
  partner_id: Partner;
}

/**
 * Base interface for Partner
 */
export interface PartnerBase extends DirectusMetadata {
  id: number;
  name: string;
  contact_email: string;
  partner_type: PartnerTypeItem[];
}

/**
 * Extended interface for frontend use
 */
export type Partner = PartnerBase & {
  // Add any additional frontend-specific properties here
}

/**
 * Interface specific for API responses
 */
export type PartnerApiItem = PartnerBase & {
    
};

/**
 * Schema for Partner validation
 */
export const partnerSchema = z.object({
  name: z.string().min(1, { message: 'validation.partner.name_required' }),
  contact_email: z.string().email({ message: 'validation.partner.email_invalid' }),
  partner_type: z.array(
    z.number().int().positive({ message: 'validation.partner.type_required' })
  )
});

export type PartnerDTOForm = z.infer<typeof partnerSchema>;

type PartnerTypeItemDTO = {
  partner_type_id: number;
  partner_id?: number;
}

export type PartnerDTO = {
  name: string,
  contact_email: string,
  partner_type: PartnerTypeItemDTO[],
};

export enum PartnerViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  EXPORT = 'export'
}
