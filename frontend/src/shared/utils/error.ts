export type KnownError = {
    message: string;
    code?: string | number;
    details?: unknown;
};

export type State<T> = {
    loading: boolean;
    error: KnownError | null;
    data: T | null;
};

export const isErrorWithMessage = (error: unknown): error is KnownError => {
    return typeof error === "object" && error !== null && "message" in error;
};

export const isNativeError = (error: unknown): error is Error => {
    return error instanceof Error;
};

export function parseDirectusError(error: unknown): KnownError | null {
    if (typeof error === "object" && error !== null && "errors" in error && Array.isArray(error.errors)) {
        const directusError = error.errors[0];

        if (typeof directusError === "object" && directusError !== null) {
            const code = directusError.extensions?.code || "UNKNOWN_DIRECTUS_ERROR";
            const originalMessage = directusError.message || "An unknown error occurred.";

            const messages: Record<string, string> = {
                FORBIDDEN: "You do not have permission to perform this action.",
                INVALID_CREDENTIALS: "Your login credentials are invalid.",
                INVALID_PAYLOAD: "The data provided is invalid or incomplete.",
                INVALID_PROVIDER: "Authentication provider not recognized.",
                INVALID_QUERY: "The query is malformed or invalid.",
                INVALID_TOKEN: "Your session token is invalid or expired.",
                ITEM_NOT_FOUND: "The requested item could not be found.",
                RECORD_NOT_UNIQUE: "A record with the same value already exists.",
                REQUEST_TOO_LARGE: "The request size exceeds the server limit.",
                ROUTE_NOT_FOUND: "The requested API route does not exist.",
                UNPROCESSABLE_ENTITY: "The server could not process the request.",
                SERVICE_UNAVAILABLE: "The server is currently unavailable. Try again later.",
                INTERNAL_SERVER_ERROR: "An unexpected server error occurred.",
                UNKNOWN_DIRECTUS_ERROR: "An unknown Directus error occurred."
            };

            const friendlyMessage = messages[code] ?? `[Directus] ${originalMessage}`;

            return {
                message: friendlyMessage,
                code,
                details: error
            };
        }
    }
    return null;
}

export function formatError(error: unknown): KnownError {
    
    const directusError = parseDirectusError(error);
    if (directusError) {
        return directusError;
    }

    if (isNativeError(error)) {
        return {
            message: error.message,
            details: error.stack
        };
    }
    
    if (isErrorWithMessage(error)) {
        return error;
    }

    return {
        message: 'An unexpected error occurred',
        details: error
    };
}


export async function executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    setState?: (state: State<T>) => void,
    initialState?: Partial<State<T>>
): Promise<T> {

    if (setState) {
        setState({
            loading: true,
            error: null,
            data: initialState?.data ?? null
        });
    }

    try {
        const result = await operation();
        if (!setState) return result;
        setState({ loading: false, error: null, data: result });
        return result;
    } catch (err: unknown) {
        console.error("Operation failed:", err);

        const error = formatError(err);
        if (!setState) throw error;
        setState({ data: initialState?.data ?? null, error, loading: false });
        throw error;
    }
}