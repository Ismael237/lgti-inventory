import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { Document, DocumentApiItem, DocumentDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "document";

class DocumentApi {
    /**
     * Get all documents
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with document list
     */
    async getAll(params?: QueryParams): Promise<DocumentApiItem[]> {
        return await directus.request<DocumentApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['-date_document'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*']
            })
        );
    }

    /**
     * Get documents with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated document response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<Document>> {
        const documents = await this.getAll(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        return {
            data: documents,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || documents.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || documents.length))
            }
        };
    }

    /**
     * Get document by ID
     * @param id - Document ID
     * @returns Promise with document data
     */
    async getById(id: number): Promise<DocumentApiItem> {
        return await directus.request<DocumentApiItem>(
            readItem(collectionName, id, {
                fields: ['*', 'document_line.*', 'user_created.*', 'user_updated.*']
            })
        );
    }

    /**
     * Create a new document
     * @param document - Document data to create
     * @returns Promise with created document
     */
    async create(document: DocumentDTO): Promise<DocumentApiItem> {
        return await directus.request<DocumentApiItem>(
            createItem(collectionName, document)
        );
    }

    /**
     * Update a document
     * @param id - Document ID
     * @param document - Document data to update
     * @returns Promise with updated document
     */
    async update(id: number, document: DocumentDTO): Promise<DocumentApiItem> {
        return await directus.request<DocumentApiItem>(
            updateItem(collectionName, id, document)
        );
    }

    /**
     * Delete a document
     * @param id - Document ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Search documents by reference or client name
     * @param searchTerm - Search term
     * @param params - Additional query parameters
     * @returns Promise with matching documents
     */
    async searchDocuments(searchTerm: string, params?: QueryParams): Promise<DocumentApiItem[]> {
        return await directus.request<DocumentApiItem[]>(
            readItems(collectionName, {
                search: searchTerm,
                sort: params?.sort || ['-date_document'],
                limit: params?.limit,
                page: params?.page,
                fields: params?.fields
            })
        );
    }

    /**
     * Get documents by type
     * @param type - Document type ('facture' or 'devis')
     * @param params - Additional query parameters
     * @returns Promise with documents of given type
     */
    async getByType(type: 'facture' | 'devis', params?: QueryParams): Promise<DocumentApiItem[]> {
        return await directus.request<DocumentApiItem[]>(
            readItems(collectionName, {
                filter: {
                    type: {
                        _eq: type
                    }
                },
                sort: params?.sort || ['-date_document'],
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*']
            })
        );
    }
}

export const documentApi = new DocumentApi();
