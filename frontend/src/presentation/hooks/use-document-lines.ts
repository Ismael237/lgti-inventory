import { useApiRequest } from './use-api-request';
import { documentLineApi } from '@api/document-line.api';
import { useDocumentLineStore } from '@store/document-line.store';
import type { DocumentLine, DocumentLineApiItem, DocumentLineDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useDocumentLines = () => {
  const { t } = useTranslation();
  const {
    data: documentLines,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchDocumentLines: storeFetchDocumentLines,
    fetchDocumentLinesByDocumentId: storeFetchDocumentLinesByDocumentId,
    selectedDocumentLineId,
    setSelectedDocumentLineId,
  } = useDocumentLineStore();

  const getStoreDocumentLines = (): DocumentLine[] => {
    if(documentLines === null) return [];
    return documentLines;
  }

  const fetchDocumentLinesRequest = useApiRequest<DocumentLineApiItem[], QueryParams>(
    (params) => documentLineApi.getAll(params),
    {
      errorMessage: t('document_lines.errors.load_failed'),
    }
  );

  const fetchPaginatedDocumentLinesRequest = useApiRequest<PaginatedResponse<DocumentLine>, QueryParams>(
    (params) => documentLineApi.getPaginated(params),
    {
      errorMessage: t('document_lines.errors.load_failed'),
    }
  );

  const fetchDocumentLineByIdRequest = useApiRequest<DocumentLine, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return documentLineApi.getById(id);
    },
    {
      errorMessage: t('document_lines.errors.load_single_failed')
    }
  );

  const fetchDocumentLinesByDocumentIdRequest = useApiRequest<DocumentLineApiItem[], { documentId: number, params?: QueryParams }>(
    (params) => {
      if (params?.documentId === undefined) {
        throw new Error(t('common.errors.document_id_required'));
      }
      return documentLineApi.getByDocumentId(params.documentId, params.params);
    },
    {
      errorMessage: t('document_lines.errors.load_by_document_failed'),
      onSuccess: (params, result) => {
        if (params?.documentId) {
          storeFetchDocumentLinesByDocumentId(params.documentId);
        }
      }
    }
  );

  const createDocumentLineRequest = useApiRequest<DocumentLineApiItem, DocumentLineDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return documentLineApi.create(params);
    },
    {
      successMessage: t('document_lines.success.created'),
      errorMessage: t('document_lines.errors.create_failed'),
      onSuccess: (params) => {
        if (params?.document_id) {
          storeFetchDocumentLinesByDocumentId(params.document_id);
        } else {
          storeFetchDocumentLines();
        }
      }
    }
  );

  const updateDocumentLineRequest = useApiRequest<DocumentLineApiItem, { id: number, documentLine: DocumentLineDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await documentLineApi.update(params.id, params.documentLine);
    },
    {
      successMessage: t('document_lines.success.updated'),
      errorMessage: t('document_lines.errors.update_failed'),
      onSuccess: (params) => {
        if (params?.documentLine?.document_id) {
          storeFetchDocumentLinesByDocumentId(params.documentLine.document_id);
        } else {
          storeFetchDocumentLines();
        }
      }
    }
  );

  const deleteDocumentLineRequest = useApiRequest<{ id: number }, { id: number, documentId?: number }>(
    (params) => {
      if (params?.id === undefined || params?.id === null) {
        throw new Error(t('common.errors.id_required'));
      }
      return documentLineApi.delete(params.id);
    },
    {
      successMessage: t('document_lines.success.deleted'),
      errorMessage: t('document_lines.errors.delete_failed'),
      onSuccess: (params, result) => {
        if (params?.documentId) {
          storeFetchDocumentLinesByDocumentId(params.documentId);
        } else {
          storeFetchDocumentLines();
        }
        
        if (selectedDocumentLineId === result.id) {
          setSelectedDocumentLineId(null);
        }
      }
    }
  );

  const createBatchDocumentLinesRequest = useApiRequest<DocumentLineApiItem[], { documentLines: DocumentLineDTO[], documentId?: number }>(
    (params) => {
      if (!params?.documentLines || !params.documentLines.length) {
        throw new Error(t('common.errors.missing_parameters'));
      }
      return documentLineApi.createBatch(params.documentLines);
    },
    {
      successMessage: t('document_lines.success.batch_created'),
      errorMessage: t('document_lines.errors.batch_create_failed'),
      onSuccess: (params) => {
        if (params?.documentId) {
          storeFetchDocumentLinesByDocumentId(params.documentId);
        } else {
          storeFetchDocumentLines();
        }
      }
    }
  );

  return {
    // Store state
    documentLines,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedDocumentLineId,
    setSelectedDocumentLineId,

    storeFetchDocumentLines,
    storeFetchDocumentLinesByDocumentId,
    getStoreDocumentLines,
    
    // API Request objects
    fetchDocumentLinesRequest,
    fetchPaginatedDocumentLinesRequest,
    fetchDocumentLineByIdRequest,
    fetchDocumentLinesByDocumentIdRequest,
    createDocumentLineRequest,
    updateDocumentLineRequest,
    deleteDocumentLineRequest,
    createBatchDocumentLinesRequest,
  };
};
