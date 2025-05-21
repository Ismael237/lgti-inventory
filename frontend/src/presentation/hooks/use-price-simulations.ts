import { useApiRequest } from './use-api-request';
import { priceSimulationApi } from '@api/price-simulation.api';
import { usePriceSimulationStore } from '@store/price-simulation.store';
import type { PriceSimulation, PriceSimulationApiItem, PriceSimulationDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const usePriceSimulations = () => {
  const { t } = useTranslation();
  const {
    data: priceSimulations,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchPriceSimulations: storeFetchPriceSimulations,
    selectedPriceSimulationId,
    setSelectedPriceSimulationId,
  } = usePriceSimulationStore();

  const getStorePriceSimulations = (): PriceSimulation[] => {
    if(priceSimulations === null) return [];
    return priceSimulations;
  }

  const fetchPriceSimulationsRequest = useApiRequest<PriceSimulationApiItem[], QueryParams>(
    (params) => priceSimulationApi.getAll(params),
    {
      errorMessage: t('priceSimulations.errors.load_failed'),
    }
  );

  const fetchPaginatedPriceSimulationsRequest = useApiRequest<PaginatedResponse<PriceSimulation>, QueryParams>(
    (params) => priceSimulationApi.getPaginated(params),
    {
      errorMessage: t('priceSimulations.errors.load_failed'),
    }
  );

  const fetchPriceSimulationByIdRequest = useApiRequest<PriceSimulationApiItem, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return priceSimulationApi.getById(id);
    },
    {
      errorMessage: t('priceSimulations.errors.load_single_failed')
    }
  );

  const createPriceSimulationRequest = useApiRequest<PriceSimulationApiItem, PriceSimulationDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return priceSimulationApi.create(params);
    },
    {
      successMessage: t('priceSimulations.success.created'),
      errorMessage: t('priceSimulations.errors.create_failed'),
      onSuccess: () => {
        storeFetchPriceSimulations();
      }
    }
  );

  const updatePriceSimulationRequest = useApiRequest<PriceSimulationApiItem, { id: number, priceSimulation: PriceSimulationDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await priceSimulationApi.update(params.id, params.priceSimulation);
    },
    {
      successMessage: t('priceSimulations.success.updated'),
      errorMessage: t('priceSimulations.errors.update_failed'),
      onSuccess: () => {
        storeFetchPriceSimulations();
      }
    }
  );

  const deletePriceSimulationRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return priceSimulationApi.delete(id);
    },
    {
      successMessage: t('priceSimulations.success.deleted'),
      errorMessage: t('priceSimulations.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchPriceSimulations();
        
        if (selectedPriceSimulationId === result.id) {
          setSelectedPriceSimulationId(null);
        }
      }
    }
  );

  return {
    // Store state
    priceSimulations,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedPriceSimulationId,
    setSelectedPriceSimulationId,

    storeFetchPriceSimulations,
    getStorePriceSimulations,
    
    // API Request objects
    fetchPriceSimulationsRequest,
    fetchPaginatedPriceSimulationsRequest,
    fetchPriceSimulationByIdRequest,
    createPriceSimulationRequest,
    updatePriceSimulationRequest,
    deletePriceSimulationRequest,
  };
};
