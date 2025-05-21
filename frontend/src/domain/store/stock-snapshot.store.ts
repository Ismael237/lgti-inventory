import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { stockSnapshotApi } from '@api/stock-snapshot.api';
import type { StockSnapshot } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface StockSnapshotStateBase extends State<StockSnapshot[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StockSnapshotState extends StockSnapshotStateBase {
  // Actions
  fetchStockSnapshots: (params?: QueryParams) => Promise<PaginatedResponse<StockSnapshot>>;
  
  // UI state
  selectedStockSnapshotId: number | null;
  setSelectedStockSnapshotId: (id: number | null) => void;

  selectedSnapshotEventId: number | null;
  setSelectedSnapshotEventId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: StockSnapshotStateBase = {
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

export const useStockSnapshotStore = create<StockSnapshotState>()((set, get) => ({
  ...initialState,
  selectedStockSnapshotId: null,
  selectedSnapshotEventId: null,
  
  fetchStockSnapshots: async (params) => {
    try {
      set({ loading: true, error: null });
      const snapshotEventId = get().selectedSnapshotEventId;
      let response;
      if(snapshotEventId){
        response = await stockSnapshotApi.getBySnapshotEventId(snapshotEventId, params);
      }else {
        response = await stockSnapshotApi.getPaginated(params);
      }
      
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
  
  setSelectedStockSnapshotId: (id) => set({ selectedStockSnapshotId: id }),

  setSelectedSnapshotEventId: (id) => set({ selectedSnapshotEventId: id }),

  resetError: () => set({ error: null}),
}));
