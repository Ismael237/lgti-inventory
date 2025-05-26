import { useApiRequest } from './use-api-request';
import { movementApi } from '@api/movement.api';
import { useMovementStore } from '@store/movement.store';
import type { Movement, MovementDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useMovements = () => {
  const { t } = useTranslation();
  const {
    data: movements,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchMovements: storeFetchMovements,
    selectedMovementId,
    setSelectedMovementId,
  } = useMovementStore();

  const getStoreMovements = (): Movement[] => {
    if(movements === null) return [];
    return movements;
  }

  const fetchMovementsRequest = useApiRequest<Movement[], QueryParams>(
    (params) => movementApi.getAll(params),
    {
      errorMessage: t('movements.errors.load_failed'),
    }
  );

  const fetchPaginatedMovementsRequest = useApiRequest<PaginatedResponse<Movement>, QueryParams>(
    (params) => movementApi.getPaginated(params),
    {
      errorMessage: t('movements.errors.load_failed'),
    }
  );

  const fetchMovementByIdRequest = useApiRequest<Movement, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return movementApi.getById(id);
    },
    {
      errorMessage: t('movements.errors.load_single_failed')
    }
  );

  const createMovementRequest = useApiRequest<Movement, MovementDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return movementApi.create(params);
    },
    {
      successMessage: t('movements.success.created'),
      errorMessage: t('movements.errors.create_failed'),
      onSuccess: () => {
        storeFetchMovements();
      }
    }
  );

  const updateMovementRequest = useApiRequest<Movement, { id: number, movement: MovementDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await movementApi.update(params.id, params.movement);
    },
    {
      successMessage: t('movements.success.updated'),
      errorMessage: t('movements.errors.update_failed'),
      onSuccess: () => {
        storeFetchMovements();
      }
    }
  );

  const deleteMovementRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return movementApi.delete(id);
    },
    {
      successMessage: t('movements.success.deleted'),
      errorMessage: t('movements.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchMovements();
        
        if (selectedMovementId === result.id) {
          setSelectedMovementId(null);
        }
      }
    }
  );

  const fetchMovementsByProductRequest = useApiRequest<PaginatedResponse<Movement>, { productId: number, params?: QueryParams }>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      if (params.productId === undefined) {
        throw new Error(t('common.errors.product_id_required'));
      }
      return movementApi.getMovementsByProduct(params.productId, params.params);
    },
    {
      errorMessage: t('movements.errors.load_by_product_failed')
    }
  );

  return {
    // Store state
    movements,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedMovementId,
    setSelectedMovementId,

    storeFetchMovements,
    getStoreMovements,
    
    // API Request objects
    fetchPaginatedMovementsRequest,
    fetchMovementsByProductRequest,
    fetchMovementByIdRequest,
    fetchMovementsRequest,
    createMovementRequest,
    updateMovementRequest,
    deleteMovementRequest,
  };
};
