import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { Product, ProductApiItem, ProductDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';
import { MovementType } from '@entities';
import { movementApi } from './movement.api';

const collectionName = "product";

class ProductApi {
    /**
     * Get all products
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with product list
     */
    async getAll(params?: QueryParams): Promise<ProductApiItem[]> {
        return await directus.request<ProductApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['reference'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }

    /**
     * Get products with current stock calculation
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with products including stock information
     */
    async getProductsWithStock(params?: QueryParams): Promise<Product[]> {
        // Get products
        const products = await this.getAll(params);
        
        // Get movements for stock calculation
        const movements = await directus.request(
            readItems('movement', {
                fields: ['product_id', 'type', 'quantity']
            })
        );
        
        // Calculate current stock for each product
        return products.map(product => {
            const productMovements = movements.filter(m => m.product_id === product.id);
            
            const incomingQuantity = productMovements
                .filter(m => m.type === MovementType.IN)
                .reduce((sum, m) => sum + Number(m.quantity), 0);
                
            const outgoingQuantity = productMovements
                .filter(m => m.type === MovementType.OUT)
                .reduce((sum, m) => sum + Number(m.quantity), 0);
                
            return {
                ...product,
                current_stock: incomingQuantity - outgoingQuantity
            };
        });
    }

    /**
     * Get products with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated product response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<Product>> {
        const items = await this.getProductsWithStock(params);
        const countResponse = await directus.request<{ count: number }[]>(
            readItems(collectionName, {
                filter: params?.filter || {},
                aggregate: { count: "*" }
            })
        );

        const products = await Promise.all(items.map(async (item) => {
            const current_stock = await movementApi.getCurrentStock(item.id);
            return {
                ...item,
                current_stock
            } as Product
        }))

        return {
            data: products,
            meta: {
                total_count: countResponse[0].count,
                page: params?.page || 1,
                limit: params?.limit || items.length,
                total_pages: Math.ceil(countResponse[0].count / (params?.limit || items.length))
            }
        };
    }

    /**
     * Get product by ID
     * @param id - Product ID
     * @returns Promise with product data
     */
    async getById(id: number): Promise<Product> {
        const item = await directus.request<ProductApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );

        const current_stock = await movementApi.getCurrentStock(item.id);

        return {
            ...item,
            current_stock
        }
    }

    /**
     * Create a new product
     * @param product - Product data to create
     * @returns Promise with created product
     */
    async create(product: ProductDTO): Promise<ProductApiItem> {
        return await directus.request<ProductApiItem>(
            createItem(collectionName, product)
        );
    }

    /**
     * Update a product
     * @param id - Product ID
     * @param product - Product data to update
     * @returns Promise with updated product
     */
    async update(id: number, product: ProductDTO): Promise<ProductApiItem> {
        return await directus.request<ProductApiItem>(
            updateItem(collectionName, id, product)
        );
    }

    /**
     * Delete a product
     * @param id - Product ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Search products by reference or description
     * @param searchTerm - Search term
     * @param params - Additional query parameters
     * @returns Promise with matching products
     */
    async searchProducts(searchTerm: string, params?: QueryParams): Promise<ProductApiItem[]> {
        return await directus.request<ProductApiItem[]>(
            readItems(collectionName, {
                search: searchTerm,
                sort: params?.sort || ['reference'],
                limit: params?.limit,
                page: params?.page,
                fields: params?.fields
            })
        );
    }

    /**
     * Get products by category ID
     * @param categoryId - Category ID
     * @param params - Additional query parameters
     * @returns Promise with products in the category
     */
    async getProductsByCategory(categoryId: number, params?: QueryParams): Promise<ProductApiItem[]> {
        return await directus.request<ProductApiItem[]>(
            readItems(collectionName, {
                filter: {
                    category_id: {
                        _eq: categoryId
                    }
                },
                sort: params?.sort || ['reference'],
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }
}

export const productApi = new ProductApi();