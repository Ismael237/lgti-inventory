import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { PartnerType } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "partner_type";

class PartnerTypeApi {
    /**
     * Get all partner types
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with partner type list
     */
    async getAll(params?: QueryParams): Promise<PartnerType[]> {
        return await directus.request<PartnerType[]>(
            readItems(collectionName, {
                sort: params?.sort || ['type_name'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }

    /**
     * Get partner types with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated partner type response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<PartnerType>> {
        const partnerTypes = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        return {
            data: partnerTypes,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || partnerTypes.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || partnerTypes.length))
            }
        };
    }

    /**
     * Get partner type by ID
     * @param id - Partner Type ID
     * @returns Promise with partner type data
     */
    async getById(id: number): Promise<PartnerType> {
        const partnerType = await directus.request<PartnerType>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );

        return partnerType;
    }

    /**
     * Create a new partner type
     * @param partnerType - Partner Type data to create
     * @returns Promise with created partner type
     */
    async create(partnerType: Omit<PartnerType, 'id'>): Promise<PartnerType> {
        return await directus.request<PartnerType>(
            createItem(collectionName, partnerType)
        );
    }

    /**
     * Update a partner type
     * @param id - Partner Type ID
     * @param partnerType - Partner Type data to update
     * @returns Promise with updated partner type
     */
    async update(id: number, partnerType: Partial<PartnerType>): Promise<PartnerType> {
        return await directus.request<PartnerType>(
            updateItem(collectionName, id, partnerType)
        );
    }

    /**
     * Delete a partner type
     * @param id - Partner Type ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }
}

export const partnerTypeApi = new PartnerTypeApi();
