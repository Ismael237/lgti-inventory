import { readItems, readItem, customEndpoint } from '@directus/sdk';
import { directus } from './directus/client';
import type { SnapshotEvent, SnapshotEventApiItem, SnapshotEventDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "snapshot_event";

class SnapshotEventApi {
    /**
     * Get all snapshot events
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with snapshot event list
     */
    async getAll(params?: QueryParams): Promise<SnapshotEventApiItem[]> {
        return await directus.request<SnapshotEventApiItem[]>(
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
     * Get snapshot events with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated snapshot event response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<SnapshotEventApiItem>> {
        const items = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter ?? {},
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
     * Get snapshot event by ID
     * @param id - Snapshot event ID
     * @returns Promise with snapshot event data
     */
    async getById(id: number): Promise<SnapshotEventApiItem> {
        return await directus.request<SnapshotEventApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );
    }

    /**
     * Create a new snapshot event
     * @param snapshotEvent - Snapshot event data to create
     * @returns Promise with created snapshot event
     */
    async create(snapshotEvent: SnapshotEventDTO): Promise<SnapshotEvent> {
        const FLOW_ID = import.meta.env.VITE_CREATE_SNAPSHOT_FLOW_ID;
        const path = `/flows/trigger/${FLOW_ID}`;

        return await directus.request(customEndpoint<SnapshotEvent>({
            path,
            method: 'POST',
            body: JSON.stringify(snapshotEvent),
        }));
    }
}

export const snapshotEventApi = new SnapshotEventApi();