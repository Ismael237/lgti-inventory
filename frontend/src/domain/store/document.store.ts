import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { documentApi } from '@api/document.api';
import type { Document } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface DocumentStateBase extends State<Document[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DocumentState extends DocumentStateBase {
  // Actions
  fetchDocuments: (params?: QueryParams) => Promise<PaginatedResponse<Document>>;
  
  // UI state
  selectedDocumentId: number | null;
  setSelectedDocumentId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: DocumentStateBase = {
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

export const useDocumentStore = create<DocumentState>()((set) => ({
  ...initialState,
  selectedDocumentId: null,
  
  fetchDocuments: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await documentApi.getPaginated(params);
      
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
  
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),

  resetError: () => set({ error: null }),
}));
