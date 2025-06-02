import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { movementApi } from '@api/movement.api';
import type { Movement } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface MovementStateBase extends State<Movement[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface MovementState extends MovementStateBase {
  // Actions
  fetchMovements: (params?: QueryParams) => Promise<PaginatedResponse<Movement>>;
  
  // UI state
  selectedMovementId: number | null;
  setSelectedMovementId: (id: number | null) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  resetError: () => void;
}

const initialState: MovementStateBase = {
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

export const useMovementStore = create<MovementState>()((set) => ({
  ...initialState,
  selectedMovementId: null,
  selectedMonth: 'all',
  
  fetchMovements: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await movementApi.getPaginated(params);
      
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
  
  setSelectedMovementId: (id) => set({ selectedMovementId: id }),

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  resetError: () => set({ error: null}),
}));