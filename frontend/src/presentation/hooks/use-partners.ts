import { useApiRequest } from './use-api-request';
import { partnerApi } from '@api/partner.api';
import { usePartnerStore } from '@store/partner.store';
import type { Partner, PartnerApiItem, PartnerDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const usePartners = () => {
  const { t } = useTranslation();
  const {
    data: partners,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchPartners: storeFetchPartners,
    selectedPartnerId,
    setSelectedPartnerId,
  } = usePartnerStore();

  const getStorePartners = (): Partner[] => {
    if (partners === null) return [];
    return partners;
  };

  const fetchPartnersRequest = useApiRequest<PartnerApiItem[], QueryParams>(
    (params) => partnerApi.getAll(params),
    {
      errorMessage: t('partners.errors.load_failed'),
    }
  );

  const fetchPaginatedPartnersRequest = useApiRequest<PaginatedResponse<Partner>, QueryParams>(
    (params) => partnerApi.getPaginated(params),
    {
      errorMessage: t('partners.errors.load_failed'),
    }
  );

  const fetchPartnerByIdRequest = useApiRequest<Partner, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return partnerApi.getById(id);
    },
    {
      errorMessage: t('partners.errors.load_single_failed'),
    }
  );

  const createPartnerRequest = useApiRequest<PartnerApiItem, PartnerDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return partnerApi.create(params);
    },
    {
      successMessage: t('partners.success.created'),
      errorMessage: t('partners.errors.create_failed'),
      onSuccess: () => {
        storeFetchPartners();
      },
    }
  );

  const updatePartnerRequest = useApiRequest<PartnerApiItem, { id: number; partner: PartnerDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await partnerApi.update(params.id, params.partner);
    },
    {
      successMessage: t('partners.success.updated'),
      errorMessage: t('partners.errors.update_failed'),
      onSuccess: () => {
        storeFetchPartners();
      },
    }
  );

  const deletePartnerRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined || id === null) {
        throw new Error(t('common.errors.id_required'));
      }
      return partnerApi.delete(id);
    },
    {
      successMessage: t('partners.success.deleted'),
      errorMessage: t('partners.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchPartners();
        if (selectedPartnerId === result.id) {
          setSelectedPartnerId(null);
        }
      },
    }
  );

  const fetchPartnersByTypeRequest = useApiRequest<PartnerApiItem[], number>(
    (typeId) => {
      if (!typeId) throw new Error(t('common.errors.type_required'));
      return partnerApi.getByType(typeId);
    },
    {
      errorMessage: t('partners.errors.load_by_type_failed'),
    }
  );

  return {
    // Store state
    partners,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedPartnerId,
    setSelectedPartnerId,

    storeFetchPartners,
    getStorePartners,

    // API Request
    fetchPartnersRequest,
    fetchPaginatedPartnersRequest,
    fetchPartnerByIdRequest,
    createPartnerRequest,
    updatePartnerRequest,
    deletePartnerRequest,
    fetchPartnersByTypeRequest,
  };
};