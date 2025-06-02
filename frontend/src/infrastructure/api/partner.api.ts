import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { Partner, PartnerApiItem, PartnerDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "partner";

class PartnerApi {
    /**
     * Get all partners
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with partner list
     */
    async getAll(params?: QueryParams): Promise<PartnerApiItem[]> {
        return await directus.request<PartnerApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['name'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*', 'partner_type.partner_type_id.*', 'partner_type.partner_id.*']
            })
        );
    }

    /**
     * Get partners with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated partner response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<Partner>> {
        const partners = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        return {
            data: partners,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || partners.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || partners.length))
            }
        };
    }

    /**
     * Get partner by ID
     * @param id - Partner ID
     * @returns Promise with partner data
     */
    async getById(id: number): Promise<PartnerApiItem> {
        return await directus.request<PartnerApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*', 'partner_type.partner_type_id.*', 'partner_type.partner_id.*']
            })
        );
    }

    /**
     * Create a new partner
     * @param partner - Partner data to create
     * @returns Promise with created partner
     */
    async create(partner: PartnerDTO): Promise<PartnerApiItem> {
        return await directus.request<PartnerApiItem>(
            createItem(collectionName, partner)
        );
    }

    /**
     * Update a partner
     * @param id - Partner ID
     * @param partner - Partner data to update
     * @returns Promise with updated partner
     */
    async update(id: number, partner: PartnerDTO): Promise<PartnerApiItem> {
        return await directus.request<PartnerApiItem>(
            updateItem(collectionName, id, partner)
        );
    }

    /**
     * Delete a partner
     * @param id - Partner ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Search partners by name or code
     * @param searchTerm - Search term
     * @param params - Additional query parameters
     * @returns Promise with matching partners
     */
    async searchPartners(searchTerm: string, params?: QueryParams): Promise<PartnerApiItem[]> {
        return await directus.request<PartnerApiItem[]>(
            readItems(collectionName, {
                search: searchTerm,
                sort: params?.sort || ['name'],
                limit: params?.limit,
                page: params?.page,
                fields: params?.fields
            })
        );
    }

    /**
     * Get partners by type
     * @param typeId - PartnerType ID
     * @param params - Additional query parameters
     * @returns Promise with partners of given type
     */
    async getByType(typeId: number, params?: QueryParams): Promise<PartnerApiItem[]> {
        return await directus.request<PartnerApiItem[]>(
            readItems(collectionName, {
                filter: {
                    partner_type: {
                        _contains: typeId
                    }
                },
                sort: params?.sort || ['name'],
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*', 'partner_types.*']
            })
        );
    }
}

export const partnerApi = new PartnerApi();