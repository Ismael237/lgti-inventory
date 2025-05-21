import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directus/client';
import type { Category, CategoryApiItem, CategoryDTO } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

const collectionName = "category";

class CategoryApi {
    /**
     * Get all categories
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with category list
     */
    async getAll(params?: QueryParams): Promise<CategoryApiItem[]> {
        return await directus.request<CategoryApiItem[]>(
            readItems(collectionName, {
                sort: params?.sort || ['name'],
                filter: params?.filter || {},
                limit: params?.limit || -1,
                page: params?.page || 1,
                fields: params?.fields || ['*.*']
            })
        );
    }

    /**
     * Get categories with pagination
     * @param params - Query parameters for filtering, sorting, and pagination
     * @returns Promise with paginated category response
     */
    async getPaginated(params?: QueryParams): Promise<PaginatedResponse<CategoryApiItem>> {
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
     * Get category by ID
     * @param id - Category ID
     * @returns Promise with category data
     */
    async getById(id: number): Promise<CategoryApiItem> {
        return await directus.request<CategoryApiItem>(
            readItem(collectionName, id, {
                fields: ['*.*']
            })
        );
    }

    /**
     * Create a new category
     * @param category - Category data to create
     * @returns Promise with created category
     */
    async create(category: CategoryDTO): Promise<CategoryApiItem> {
        return await directus.request<CategoryApiItem>(
            createItem(collectionName, category)
        );
    }

    /**
     * Update a category
     * @param id - Category ID
     * @param category - Category data to update
     * @returns Promise with updated category
     */
    async update(id: number, category: CategoryDTO): Promise<CategoryApiItem> {
        return await directus.request<CategoryApiItem>(
            updateItem(collectionName, id, category)
        );
    }

    /**
     * Delete a category
     * @param id - Category ID
     * @returns Promise with deletion result
     */
    async delete(id: number): Promise<{ id: number }> {
        await directus.request(
            deleteItem(collectionName, id)
        );
        return { id };
    }

    /**
     * Get categories as a hierarchical tree
     * @returns Promise with hierarchical category tree
     */
    async getHierarchicalTree(): Promise<Category[]> {
        const categories = await this.getAll();

        // Create a map of categories by ID
        const categoryMap = new Map<number, Category>();
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Build the tree
        const rootCategories: Category[] = [];

        categoryMap.forEach(category => {
            if (category.parent_id === null) {
                rootCategories.push(category);
            } else {
                const parent = categoryMap.get(category.parent_id.id);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(category);
                }
            }
        });

        return rootCategories;
    }

    /**
 * Get categories by parent ID directly from API
 * @param parentId - Parent category ID or null for root categories
 * @returns Promise with list of child categories
 */
    async getCategoriesByParentId(parentId: number | null): Promise<CategoryApiItem[]> {
        return await directus.request<CategoryApiItem[]>(
            readItems(collectionName, {
                filter: { parent_id: { _eq: parentId } },
                sort: ['name']
            })
        );
    }

    /**
     * Get root categories (those without parent)
     * @returns Promise with list of root categories
     */
    async getRootCategories(): Promise<CategoryApiItem[]> {
        return this.getCategoriesByParentId(null);
    }

    /**
     * Get child categories for a given parent ID
     * @param parentId - Parent category ID
     * @returns Promise with list of child categories
     */
    async getChildCategories(parentId: number): Promise<CategoryApiItem[]> {
        return this.getCategoriesByParentId(parentId);
    }

    /**
     * Check if category has children
     * @param categoryId - Category ID to check
     * @returns Promise with boolean indicating if category has children
     */
    async hasChildren(categoryId: number): Promise<boolean> {
        const children = await this.getCategoriesByParentId(categoryId);
        return children.length > 0;
    }

    /**
     * Get category path (ancestors)
     * @param categoryId - Category ID to get path for
     * @returns Promise with array of categories representing the path
     */
    async getCategoryPath(categoryId: number): Promise<CategoryApiItem[]> {
        const path: CategoryApiItem[] = [];
        let current = await this.getById(categoryId);

        if (!current) return path;

        path.unshift(current);

        while (current.parent_id) {
            current = await this.getById(current.parent_id.id);
            if (!current) break;
            path.unshift(current);
        }

        return path;
    }

    /**
     * Get flat categories with level information
     * @returns Promise with enhanced category list containing level information
     */
    async getFlatCategoriesWithLevel(): Promise<(CategoryApiItem & { level: number })[]> {
        const allCategories = await this.getAll();
        const result: (CategoryApiItem & { level: number })[] = [];

        // Create a map for quick access
        const categoryMap = new Map<number, CategoryApiItem>();
        allCategories.forEach(category => {
            categoryMap.set(category.id, category);
        });

        // Calculate level for each category
        for (const category of allCategories) {
            let level = 0;
            let parent = category.parent_id ? categoryMap.get(category.parent_id.id) : null;

            while (parent) {
                level++;
                parent = parent.parent_id ? categoryMap.get(parent.parent_id.id) : null;
            }

            result.push({ ...category, level });
        }

        // Sort by hierarchy
        result.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });

        return result;
    }
}

export const categoryApi = new CategoryApi();