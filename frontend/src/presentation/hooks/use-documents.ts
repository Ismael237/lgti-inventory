import { useApiRequest } from './use-api-request';
import { documentApi } from '@api/document.api';
import { useDocumentStore } from '@store/document.store';
import type { Document, DocumentApiItem, DocumentDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useDocuments = () => {
  const { t } = useTranslation();
  const {
    data: documents,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchDocuments: storeFetchDocuments,
    selectedDocumentId,
    setSelectedDocumentId,
  } = useDocumentStore();

  const getStoreDocuments = (): Document[] => {
    if(documents === null) return [];
    return documents;
  }

  const fetchDocumentsRequest = useApiRequest<DocumentApiItem[], QueryParams>(
    (params) => documentApi.getAll(params),
    {
      errorMessage: t('documents.errors.load_failed'),
    }
  );

  const fetchPaginatedDocumentsRequest = useApiRequest<PaginatedResponse<Document>, QueryParams>(
    (params) => documentApi.getPaginated(params),
    {
      errorMessage: t('documents.errors.load_failed'),
    }
  );

  const fetchDocumentByIdRequest = useApiRequest<Document, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return documentApi.getById(id);
    },
    {
      errorMessage: t('documents.errors.load_single_failed')
    }
  );

  const createDocumentRequest = useApiRequest<DocumentApiItem, DocumentDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return documentApi.create(params);
    },
    {
      successMessage: t('documents.success.created'),
      errorMessage: t('documents.errors.create_failed'),
      onSuccess: () => {
        storeFetchDocuments();
      }
    }
  );

  const updateDocumentRequest = useApiRequest<DocumentApiItem, { id: number, document: DocumentDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await documentApi.update(params.id, params.document);
    },
    {
      successMessage: t('documents.success.updated'),
      errorMessage: t('documents.errors.update_failed'),
      onSuccess: () => {
        storeFetchDocuments();
      }
    }
  );

  const deleteDocumentRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined || id === null) {
        throw new Error(t('common.errors.id_required'));
      }
      return documentApi.delete(id);
    },
    {
      successMessage: t('documents.success.deleted'),
      errorMessage: t('documents.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchDocuments();
        
        if (selectedDocumentId === result.id) {
          setSelectedDocumentId(null);
        }
      }
    }
  );

  const fetchDocumentsByTypeRequest = useApiRequest<DocumentApiItem[], { type: 'facture' | 'devis', params?: QueryParams }>(
    (params) => {
      if(!params?.type) throw new Error(t('common.errors.type_required'));
      return documentApi.getByType(params.type, params.params);
    },
    {
      errorMessage: t('documents.errors.load_by_type_failed')
    }
  );

  const searchDocumentsRequest = useApiRequest<DocumentApiItem[], { searchTerm: string, params?: QueryParams }>(
    (params) => {
      if(!params?.searchTerm) throw new Error(t('common.errors.search_term_required'));
      return documentApi.searchDocuments(params.searchTerm, params.params);
    },
    {
      errorMessage: t('documents.errors.search_failed')
    }
  );

  return {
    // Store state
    documents,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedDocumentId,
    setSelectedDocumentId,

    storeFetchDocuments,
    getStoreDocuments,
    
    // API Request objects
    fetchDocumentsRequest,
    fetchPaginatedDocumentsRequest,
    fetchDocumentByIdRequest,
    createDocumentRequest,
    updateDocumentRequest,
    deleteDocumentRequest,
    fetchDocumentsByTypeRequest,
    searchDocumentsRequest,
  };
};
