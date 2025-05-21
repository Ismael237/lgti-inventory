import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { formatError, type KnownError } from '@utils/error';
import type { QueryParams } from '@types';

interface UseApiRequestOptions<T> {
  onSuccess?: (action: string, result: T) => void;
  onError?: (action: string, error: KnownError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface UseApiRequestResult<T, P> {
  execute: (params?: P, action?: string) => Promise<T>;
  isLoading: boolean;
  error: KnownError | null;
  data: T | null;
  reset: () => void;
}

/**
 * Custom hook to handle API requests
 * @param apiFunction - Function that performs the API request (returns a Promise)
 * @param options - Configuration options
 * @returns Object containing execute function, loading state, error and data
 */
export function useApiRequest<T, P = QueryParams>(
  apiFunction: (params?: P) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
): UseApiRequestResult<T, P> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'An error occurred',
  } = options;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<KnownError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { showSuccess, showError } = useToast();

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  const execute = useCallback(
    async (params?: P, action: string = 'execute'): Promise<T> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(params);
        setData(result);
        
        if (successMessage) {
          showSuccess(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(action, result);
        }
        
        return result;
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        
        if (errorMessage) {
          showError(errorMessage, formattedError.message);
        }
        
        if (onError) {
          onError(action, formattedError);
        }
        
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, successMessage, onSuccess, showSuccess, errorMessage, onError, showError]
  );

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  };
}