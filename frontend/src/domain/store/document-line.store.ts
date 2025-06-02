import { create } from 'zustand';
import { formatError } from '@utils/error';
import type { State } from '@utils/error';
import { documentLineApi } from '@api/document-line.api';
import type { DocumentLine } from '@entities';
import type { PaginatedResponse, QueryParams } from '@types';

interface DocumentLineStateBase extends State<DocumentLine[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DocumentLineState extends DocumentLineStateBase {
  // Actions
  fetchDocumentLines: (params?: QueryParams) => Promise<PaginatedResponse<DocumentLine>>;
  fetchDocumentLinesByDocumentId: (documentId: number, params?: QueryParams) => Promise<DocumentLine[]>;
  
  // UI state
  selectedDocumentLineId: number | null;
  setSelectedDocumentLineId: (id: number | null) => void;
  resetError: () => void;
}

const initialState: DocumentLineStateBase = {
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

export const useDocumentLineStore = create<DocumentLineState>()((set) => ({
  ...initialState,
  selectedDocumentLineId: null,
  
  fetchDocumentLines: async (params) => {
    try {
      set({ loading: true, error: null });
      const response = await documentLineApi.getPaginated(params);
      
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
  
  fetchDocumentLinesByDocumentId: async (documentId, params) => {
    try {
      set({ loading: true, error: null });
      const documentLines = await documentLineApi.getByDocumentId(documentId, params);
      
      set({
        data: documentLines,
        loading: false,
        error: null
      });
      
      return documentLines;
    } catch (error) {
      const formattedError = formatError(error);
      set({ loading: false, error: formattedError, data: initialState.data });
      throw error;
    }
  },
  
  setSelectedDocumentLineId: (id) => set({ selectedDocumentLineId: id }),

  resetError: () => set({ error: null }),
}));
