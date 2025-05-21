import { useApiRequest } from './use-api-request';
import { stockSnapshotApi } from '@api/stock-snapshot.api';
import { useStockSnapshotStore } from '@store/stock-snapshot.store';
import type { StockSnapshot, StockSnapshotApiItem } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useStockSnapshots = () => {
  const { t } = useTranslation();
  const {
    data: stockSnapshots,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchStockSnapshots: storeFetchStockSnapshots,
    selectedStockSnapshotId,
    setSelectedStockSnapshotId,
    selectedSnapshotEventId,
    setSelectedSnapshotEventId,
  } = useStockSnapshotStore();

  const getStoreStockSnapshots = (): StockSnapshot[] => {
    if(stockSnapshots === null) return [];
    return stockSnapshots;
  }

  const fetchStockSnapshotsRequest = useApiRequest<StockSnapshotApiItem[], QueryParams>(
    stockSnapshotApi.getAll,
    {
      errorMessage: t('stockSnapshots.errors.load_failed'),
      onSuccess: () => {
        storeFetchStockSnapshots();
      }
    }
  );

  const fetchPaginatedStockSnapshotsRequest = useApiRequest<PaginatedResponse<StockSnapshotApiItem>, QueryParams>(
    stockSnapshotApi.getPaginated,
    {
      successMessage: t('stockSnapshots.success.loaded'),
      errorMessage: t('stockSnapshots.errors.load_failed'),
      onSuccess: () => {
        storeFetchStockSnapshots();
      }
    }
  );

  const fetchStockSnapshotByIdRequest = useApiRequest<StockSnapshotApiItem, number>(
    (id) => {
      if (id === undefined || id === null) {
        throw new Error(t('common.errors.id_required'));
      }
      return stockSnapshotApi.getById(id);
    },
    {
      errorMessage: t('stockSnapshots.errors.load_single_failed')
    }
  );

  const fetchBySnapshotEventIdRequest = useApiRequest<PaginatedResponse<StockSnapshotApiItem>, number>(
    (snapshotEventId) => {
      if (snapshotEventId === undefined || snapshotEventId === null) {
        throw new Error(t('common.errors.snapshot_event_id_required'));
      }
      return stockSnapshotApi.getBySnapshotEventId(snapshotEventId);
    },
    {
      errorMessage: t('stockSnapshots.errors.load_by_event_failed')
    }
  );

  const fetchByProductIdRequest = useApiRequest<StockSnapshotApiItem[], number>(
    (productId) => {
      if (productId === undefined || productId === null) {
        throw new Error(t('common.errors.product_id_required'));
      }
      return stockSnapshotApi.getByProductId(productId);
    },
    {
      errorMessage: t('stockSnapshots.errors.load_by_product_failed')
    }
  );

  return {
    // Store state
    stockSnapshots,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedStockSnapshotId,
    setSelectedStockSnapshotId,
    selectedSnapshotEventId,
    setSelectedSnapshotEventId,

    storeFetchStockSnapshots,
    getStoreStockSnapshots,
    
    // API Request objects
    fetchStockSnapshotsRequest,
    fetchPaginatedStockSnapshotsRequest,
    fetchStockSnapshotByIdRequest,
    fetchBySnapshotEventIdRequest,
    fetchByProductIdRequest,
  };
};
