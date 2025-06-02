import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { partnerApi } from '@api/partner.api';
import type { Partner } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface PartnerStateBase extends State<Partner[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PartnerState extends PartnerStateBase {
  // Actions
  fetchPartners: (params?: QueryParams) => Promise<PaginatedResponse<Partner>>;

  // UI state
  selectedPartnerId: number | null;
  setSelectedPartnerId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: PartnerStateBase = {
  data: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export const usePartnerStore = create<PartnerState>()((set) => ({
  ...initialState,
  selectedPartnerId: null,

  fetchPartners: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await partnerApi.getPaginated(params);

      set({
        data: response.data,
        loading: false,
        error: null,
        pagination: {
          total: response.meta.total_count,
          page: response.meta.page,
          limit: response.meta.limit,
          totalPages: response.meta.total_pages,
        },
      });

      return response;
    } catch (error) {
      const formattedError = formatError(error);
      set({ loading: false, error: formattedError, data: initialState.data });
      throw error;
    }
  },

  setSelectedPartnerId: (id) => set({ selectedPartnerId: id }),

  resetError: () => set({ error: null }),
}));