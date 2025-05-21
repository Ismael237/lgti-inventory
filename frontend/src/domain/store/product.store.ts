import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { productApi } from '@api/product.api';
import type { Product } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface ProductStateBase extends State<Product[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductState extends ProductStateBase {
  // Actions
  fetchProducts: (params?: QueryParams) => Promise<PaginatedResponse<Product>>;
  
  // UI state
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: ProductStateBase = {
  data: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }
};

export const useProductStore = create<ProductState>()((set) => ({
  ...initialState,
  selectedProductId: null,
  
  fetchProducts: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await productApi.getPaginated(params);
      
      set({
        data: response.data,
        loading: false,
        error: null,
        pagination: {
          total: response.meta.total_count,
          page: response.meta.page,
          limit: response.meta.limit,
          totalPages: response.meta.total_pages
        }
      });
      
      return response;
    } catch (error) {
      const formattedError = formatError(error);
      set({ loading: false, error: formattedError, data: initialState.data });
      throw error;
    }
  },
  
  setSelectedProductId: (id) => set({ selectedProductId: id }),

  resetError: () => set({ error: null}),
}));