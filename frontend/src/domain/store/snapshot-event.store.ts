import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { snapshotEventApi } from '@api/snapshot-event.api';
import type { SnapshotEventApiItem as SnapshotEvent } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface SnapshotEventStateBase extends State<SnapshotEvent[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SnapshotEventState extends SnapshotEventStateBase {
  // Actions
  fetchSnapshotEvents: (params?: QueryParams) => Promise<PaginatedResponse<SnapshotEvent>>;
  
  // UI state
  selectedSnapshotEventId: number | null;
  setSelectedSnapshotEventId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: SnapshotEventStateBase = {
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

export const useSnapshotEventStore = create<SnapshotEventState>()((set) => ({
  ...initialState,
  selectedSnapshotEventId: null,
  
  fetchSnapshotEvents: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await snapshotEventApi.getPaginated(params);
      
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
  setSelectedSnapshotEventId: (id) => set({ selectedSnapshotEventId: id }),
  
  resetError: () => set({ error: null}),
}));