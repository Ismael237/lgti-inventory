import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { DocumentLine, DocumentLineApiItem, DocumentLineDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "document_line";

class DocumentLineApi {
    /**
     * Get all document lines
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with document line list
     */
    async getAll(params?: QueryParams): Promise<DocumentLineApiItem[]> {
        return await directus.request<DocumentLineApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['id'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*']
            })
        );
    }

    /**
     * Get document lines with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated document line response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<DocumentLine>> {
        const documentLines = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        return {
            data: documentLines,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || documentLines.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || documentLines.length))
            }
        };
    }

    /**
     * Get document line by ID
     * @param id - Document Line ID
     * @returns Promise with document line data
     */
    async getById(id: number): Promise<DocumentLineApiItem> {
        return await directus.request<DocumentLineApiItem>(
            readItem(collectionName, id, {
                fields: ['*']
            })
        );
    }

    /**
     * Create a new document line
     * @param documentLine - Document Line data to create
     * @returns Promise with created document line
     */
    async create(documentLine: DocumentLineDTO): Promise<DocumentLineApiItem> {
        return await directus.request<DocumentLineApiItem>(
            createItem(collectionName, documentLine)
        );
    }

    /**
     * Update a document line
     * @param id - Document Line ID
     * @param documentLine - Document Line data to update
     * @returns Promise with updated document line
     */
    async update(id: number, documentLine: DocumentLineDTO): Promise<DocumentLineApiItem> {
        return await directus.request<DocumentLineApiItem>(
            updateItem(collectionName, id, documentLine)
        );
    }

    /**
     * Delete a document line
     * @param id - Document Line ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Get document lines by document ID
     * @param documentId - Document ID
     * @param params - Additional query parameters
     * @returns Promise with document lines for the specified document
     */
    async getByDocumentId(documentId: number, params?: QueryParams): Promise<DocumentLineApiItem[]> {
        return await directus.request<DocumentLineApiItem[]>(
            readItems(collectionName, {
                filter: {
                    document_id: {
                        _eq: documentId
                    }
                },
                sort: params?.sort || ['id'],
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*']
            })
        );
    }

    /**
     * Create multiple document lines in a batch
     * @param documentLines - Array of document lines to create
     * @returns Promise with created document lines
     */
    async createBatch(documentLines: DocumentLineDTO[]): Promise<DocumentLineApiItem[]> {
        return await directus.request<DocumentLineApiItem[]>(
            createItem(collectionName, documentLines)
        );
    }
}

export const documentLineApi = new DocumentLineApi();
