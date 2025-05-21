/**
 * ID manipulation helper functions
 */

/**
 * Ensures a value is an array of IDs
 * If input is already an array, returns it unchanged
 * If input is a single ID, wraps it in an array
 * If input is null/undefined, returns an empty array
 *
 * @param id - A single ID value or array of IDs or null/undefined
 * @returns An array of IDs
 */
export const ensureIdArray = <T>(id: T | T[] | null | undefined): T[] => {
    if (id === null || id === undefined) {
        return [];
    }

    return Array.isArray(id) ? id : [id];
};

/**
 * Gets the first ID from an array of IDs
 * If input is an array, returns the first element
 * If input is empty array, returns null
 * If input is null/undefined, returns null
 *
 * @param ids - Array of IDs or null/undefined
 * @returns The first ID or null if none exists
 */
export const getFirstId = <T>(ids: T[] | null | undefined): T | null => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return null;
    }

    return ids[0];
};

/**
 * Safely converts a string ID to a number
 * If input is a valid number string, converts to number
 * If input is not a valid number, returns fallback value
 *
 * @param id - ID as string
 * @param fallback - Value to return if conversion fails (default: undefined)
 * @returns ID as number or fallback value
 */
export const safeParseId = (id: string | undefined, fallback: number | undefined = undefined): number | undefined => {
    if (!id) {
        return fallback;
    }

    const parsedId = parseInt(id, 10);
    return isNaN(parsedId) ? fallback : parsedId;
};

/**
 * Normalizes an ID value to a specific type
 * Useful for handling IDs that could be in various formats (number, string, etc.)
 *
 * @param id - ID in any format
 * @param defaultValue - Default value to return if ID is invalid
 * @returns Normalized ID value
 */
export const normalizeId = <T>(id: unknown, defaultValue: T): T => {
    if (id === null || id === undefined || id === '') {
        return defaultValue;
    }

    // If we're expecting a number and got a string, try to convert
    if (typeof defaultValue === 'number' && typeof id === 'string') {
        const parsedId = parseFloat(id);
        return isNaN(parsedId) ? defaultValue : parsedId as unknown as T;
    }

    // If types match, return as is
    if (typeof id === typeof defaultValue) {
        return id as T;
    }

    return defaultValue;
};

/**
 * Finds an entity by ID in an array of entities
 *
 * @param entities - Array of entities with id property
 * @param id - ID to search for
 * @returns The found entity or undefined
 */
export const findEntityById = <T extends { id: string | number }>(
    entities: T[] | null | undefined,
    id: string | number | null | undefined
): T | undefined => {
    if (!entities || !id) {
        return undefined;
    }

    return entities.find(entity => entity.id.toString() === id.toString());
};