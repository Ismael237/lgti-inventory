import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { Movement, MovementApiItem, MovementDTO } from '@entities';
import { MovementType } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "movement";

class MovementApi {
    /**
     * Get all movements
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with movement list
     */
    async getAll(params?: QueryParams): Promise<MovementApiItem[]> {
        return await directus.request<MovementApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['-date_created'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }

    /**
     * Get movements with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated movement response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<Movement>> {
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
     * Get movement by ID
     * @param id - Movement ID
     * @returns Promise with movement data
     */
    async getById(id: number): Promise<MovementApiItem> {
        return await directus.request<MovementApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );
    }

    /**
     * Create a new movement
     * @param movement - Movement data to create
     * @returns Promise with created movement
     */
    async create(movement: MovementDTO): Promise<MovementApiItem> {
        return await directus.request<MovementApiItem>(
            createItem(collectionName, movement)
        );
    }

    /**
     * Update a movement
     * @param id - Movement ID
     * @param movement - Movement data to update
     * @returns Promise with updated movement
     */
    async update(id: number, movement: MovementDTO): Promise<MovementApiItem> {
        return await directus.request<MovementApiItem>(
            updateItem(collectionName, id, movement)
        );
    }

    /**
     * Delete a movement
     * @param id - Movement ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Get all movements for a specific product
     * @param productId - Product ID
     * @param params - Additional query parameters
     * @returns Promise with movements for the product
     */
    async getMovementsByProduct(productId: number, params?: QueryParams): Promise<PaginatedResponse<Movement>> {
        return this.getPaginated({
            filter: {
                product_id: {
                    _eq: productId
                }
            },
            ...params
        });
    }

    /**
     * Get current stock for a specific product
     * @param productId - Product ID
     * @returns Promise with current stock quantity
     */
    async getCurrentStock(productId: number): Promise<number> {
        const movements = await this.getMovementsByProduct(productId);

        const incomingQuantity = movements.data
            .filter(m => m.type === MovementType.IN)
            .reduce((sum, m) => sum + Number(m.quantity), 0);

        const outgoingQuantity = movements.data
            .filter(m => m.type === MovementType.OUT)
            .reduce((sum, m) => sum + Number(m.quantity), 0);

        return incomingQuantity - outgoingQuantity;
    }
}

export const movementApi = new MovementApi();