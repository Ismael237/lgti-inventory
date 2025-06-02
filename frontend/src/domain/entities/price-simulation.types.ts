import type { DirectusMetadata } from '@types';
import { z } from '@i18n';

/**
 * Base interface for PriceSimulation
 */
export interface PriceSimulationBase extends DirectusMetadata {
  id: number;
  scenario_name: string;
  factor: number;
}

/**
 * Extended interface for frontend use
 */
export type PriceSimulation = PriceSimulationBase & {

}

/**
 * Type specific for API responses
 */
export type PriceSimulationApiItem = PriceSimulationBase & {
  // Additional properties specific to the API response if needed
}

export type PriceSimulationDTO = {
  scenario_name: string,
  factor: number;
}

/**
 * Schema for PriceSimulation validation
 */
export const priceSimulationSchema = z.object({
  scenario_name: z.string().min(1, { message: 'validation.price_simulation.scenario_name_required' }),
  factor: z.coerce.number().min(0, { message: 'validation.price_simulation.factor_not_negative' }),
});

export type PriceSimulationDTOForm = z.infer<typeof priceSimulationSchema>;

export enum PriceSimulationViewType {
  LIST = 'list',
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
  DETAILS = 'details',
  EXPORT = 'export'
}