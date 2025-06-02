import { useApiRequest } from './use-api-request';
import { partnerTypeApi } from '@api/partner-type.api';
import type { PartnerType } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const usePartnerTypes = () => {
  const { t } = useTranslation();
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartnerTypeId, setSelectedPartnerTypeId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchPartnerTypes = async (params?: QueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await partnerTypeApi.getAll(params);
      setPartnerTypes(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPartnerTypes = (): PartnerType[] => {
    if(partnerTypes === null) return [];
    return partnerTypes;
  };

  const fetchPartnerTypesRequest = useApiRequest<PartnerType[], QueryParams>(
    (params) => partnerTypeApi.getAll(params),
    {
      errorMessage: t('partnerTypes.errors.load_failed', 'Failed to load partner types'),
      onSuccess: (data) => {
        setPartnerTypes(data);
      }
    }
  );

  const fetchPaginatedPartnerTypesRequest = useApiRequest<PaginatedResponse<PartnerType>, QueryParams>(
    (params) => partnerTypeApi.getPaginated(params),
    {
      errorMessage: t('partnerTypes.errors.load_failed', 'Failed to load partner types'),
      onSuccess: (response) => {
        setPartnerTypes(response.data);
        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total_count,
          totalPages: response.meta.total_pages
        });
      }
    }
  );

  const fetchPartnerTypeByIdRequest = useApiRequest<PartnerType, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required', 'ID is required'));
      }
      return partnerTypeApi.getById(id);
    },
    {
      errorMessage: t('partnerTypes.errors.load_single_failed', 'Failed to load partner type')
    }
  );

  const createPartnerTypeRequest = useApiRequest<PartnerType, Omit<PartnerType, 'id'>>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters', 'Missing parameters'));
      return partnerTypeApi.create(params);
    },
    {
      successMessage: t('partnerTypes.success.created', 'Partner type created successfully'),
      errorMessage: t('partnerTypes.errors.create_failed', 'Failed to create partner type'),
      onSuccess: () => {
        fetchPartnerTypes();
      }
    }
  );

  const updatePartnerTypeRequest = useApiRequest<PartnerType, { id: number, partnerType: Partial<PartnerType> }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters', 'Missing parameters'));
      return await partnerTypeApi.update(params.id, params.partnerType);
    },
    {
      successMessage: t('partnerTypes.success.updated', 'Partner type updated successfully'),
      errorMessage: t('partnerTypes.errors.update_failed', 'Failed to update partner type'),
      onSuccess: () => {
        fetchPartnerTypes();
      }
    }
  );

  const deletePartnerTypeRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined || id === null) {
        throw new Error(t('common.errors.id_required', 'ID is required'));
      }
      return partnerTypeApi.delete(id);
    },
    {
      successMessage: t('partnerTypes.success.deleted', 'Partner type deleted successfully'),
      errorMessage: t('partnerTypes.errors.delete_failed', 'Failed to delete partner type'),
      onSuccess: (_, result) => {
        fetchPartnerTypes();
        
        if (selectedPartnerTypeId === result.id) {
          setSelectedPartnerTypeId(null);
        }
      }
    }
  );

  return {
    // State
    partnerTypes,
    loading,
    error,
    pagination,
    selectedPartnerTypeId,
    setSelectedPartnerTypeId,

    // Methods
    fetchPartnerTypes,
    getPartnerTypes,
    
    // API Request objects
    fetchPartnerTypesRequest,
    fetchPaginatedPartnerTypesRequest,
    fetchPartnerTypeByIdRequest,
    createPartnerTypeRequest,
    updatePartnerTypeRequest,
    deletePartnerTypeRequest,
  };
};
