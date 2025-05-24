import { readItems, readItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { StockSnapshot, StockSnapshotApiItem } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';
import { movementApi } from './movement.api';

const collectionName = "stock_snapshot";

class StockSnapshotApi {
    /**
     * Get all stock snapshots
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with stock snapshot list
     */
    async getAll(params?: QueryParams): Promise<StockSnapshotApiItem[]> {
        return await directus.request<StockSnapshotApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['-id'],
                filter: params?.filter ?? {},
                limit: params?.limit ?? -1,
                page: params?.page ?? 1,
                fields: params?.fields ?? ['*.*']
            })
        );
    }

    /**
     * Get stock snapshots with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated stock snapshot response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<StockSnapshot>> {
        const items = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter ?? {},
                aggregate: { count: "*" }
            })
        );

        const stockSnapshots = await Promise.all(items.map(async (item) => {
            const current_stock = await movementApi.getCurrentStock(item.product_id.id);
            return {
                ...item,
                product_id: {
                    ...item.product_id,
                    current_stock
                }
            } as StockSnapshot
        }))

        return {
            data: stockSnapshots,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || items.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || items.length))
            }
        };
    }

    /**
     * Get stock snapshot by ID
     * @param id - Stock snapshot ID
     * @returns Promise with stock snapshot data
     */
    async getById(id: number): Promise<StockSnapshotApiItem> {
        return await directus.request<StockSnapshotApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );
    }

    /**
     * Get stock snapshots by snapshot event ID
     * @param snapshotEventId - Snapshot event ID
     * @param params - Additional query parameters
     * @returns Promise with stock snapshots for the event
     */
    async getBySnapshotEventId(snapshotEventId: number, params?: QueryParams): Promise<PaginatedResponse<StockSnapshotApiItem>> {
        return this.getPaginated({
            filter: {
                snapshot_event_id: {
                    _eq: snapshotEventId
                }
            },
            sort: params?.sort || ['product_id.reference'],
            ...params,
        })
    }

    /**
     * Get stock snapshots by product ID
     * @param productId - Product ID
     * @param params - Additional query parameters
     * @returns Promise with stock snapshots for the product
     */
    async getByProductId(productId: number, params?: QueryParams): Promise<StockSnapshotApiItem[]> {
        return await directus.request<StockSnapshotApiItem[]>(
            readItems(collectionName, {
                filter: {
                    product_id: {
                        _eq: productId
                    }
                },
                sort: params?.sort || ['-id'],
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }
}

export const stockSnapshotApi = new StockSnapshotApi();
