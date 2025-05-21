import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { priceSimulationApi } from '@api/price-simulation.api';
import type { PriceSimulation } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface PriceSimulationStateBase extends State<PriceSimulation[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PriceSimulationState extends PriceSimulationStateBase {
  // Actions
  fetchPriceSimulations: (params?: QueryParams) => Promise<PaginatedResponse<PriceSimulation>>;
  
  // UI state
  selectedPriceSimulationId: number | null;
  setSelectedPriceSimulationId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: PriceSimulationStateBase = {
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

export const usePriceSimulationStore = create<PriceSimulationState>()((set) => ({
  ...initialState,
  selectedPriceSimulationId: null,
  
  fetchPriceSimulations: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await priceSimulationApi.getPaginated(params);
      
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
  
  setSelectedPriceSimulationId: (id) => set({ selectedPriceSimulationId: id }),

  resetError: () => set({ error: null}),
}));