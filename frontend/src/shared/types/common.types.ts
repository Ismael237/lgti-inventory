import type { DirectusUser } from "@directus/sdk";

/**
 * Base interface for Directus metadata fields
 */
export interface DirectusMetadata {
    user_created: DirectusUser;
    user_updated: DirectusUser | null;
    date_created: string;
    date_updated: string | null;
}

/**
 * Interface for pagination query parameters
 */
export interface PaginationParams {
    offset?: number;
    page?: number;
    limit?: number;
}

/**
 * Interface for filters query parameters
 */
export interface FilterParams {
    filter?: Record<string, unknown>;
    search?: string;
    sort?: string | string[];
}

/**
 * Interface for query parameters
 */
export interface QueryParams extends PaginationParams, FilterParams {
    fields?: string[];
}

/**
 * Interface for pagination response
 */
export interface PaginationMeta {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * Interface for generic API response
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

/**
 * Generic interface for ID parameter
 */
export interface IdParam {
    id: number | string;
}