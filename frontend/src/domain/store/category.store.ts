import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { categoryApi } from '@api/category.api';
import type { Category } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';


interface CategoryStateBase extends State<Category[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CategoryState extends CategoryStateBase {
  // Actions
  fetchCategories: (params?: QueryParams) => Promise<PaginatedResponse<Category>>;
  
  // UI state
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: CategoryStateBase = {
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

export const useCategoryStore = create<CategoryState>()((set) => ({
  ...initialState,
  selectedCategoryId: null,
  
  fetchCategories: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await categoryApi.getPaginated(params);
      
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
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  resetError: () => set({ error: null}),
}));