import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { PriceSimulation, PriceSimulationApiItem, PriceSimulationDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "price_simulation";

class PriceSimulationApi {
    /**
     * Get all price simulations
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with price simulation list
     */
    async getAll(params?: QueryParams): Promise<PriceSimulationApiItem[]> {
        return await directus.request<PriceSimulationApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['scenario_name'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }

    /**
     * Get price simulations with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated price simulation response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<PriceSimulation>> {
        const items = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        return {
            data: items,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || items.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || items.length))
            }
        };
    }

    /**
     * Get price simulation by ID
     * @param id - Price simulation ID
     * @returns Promise with price simulation data
     */
    async getById(id: number): Promise<PriceSimulationApiItem> {
        return await directus.request<PriceSimulationApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );
    }

    /**
     * Create a new price simulation
     * @param priceSimulation - Price simulation data to create
     * @returns Promise with created price simulation
     */
    async create(priceSimulation: PriceSimulationDTO): Promise<PriceSimulationApiItem> {
        return await directus.request<PriceSimulationApiItem>(
            createItem(collectionName, priceSimulation)
        );
    }

    /**
     * Update a price simulation
     * @param id - Price simulation ID
     * @param priceSimulation - Price simulation data to update
     * @returns Promise with updated price simulation
     */
    async update(id: number, priceSimulation: PriceSimulationDTO): Promise<PriceSimulationApiItem> {
        return await directus.request<PriceSimulationApiItem>(
            updateItem(collectionName, id, priceSimulation)
        );
    }

    /**
     * Delete a price simulation
     * @param id - Price simulation ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }
}

export const priceSimulationApi = new PriceSimulationApi();