import { useApiRequest } from './use-api-request';
import { useSnapshotEventStore } from '@store/snapshot-event.store';
import { snapshotEventApi } from '@api/snapshot-event.api';
import type { SnapshotEventApiItem, SnapshotEventDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useSnapshotEvents = () => {
  const { t } = useTranslation();
  const {
    data: snapshotEvents,
    loading,
    error,
    pagination,
    fetchSnapshotEvents: storeFetchSnapshotEvents,
    selectedSnapshotEventId,
    setSelectedSnapshotEventId,
    resetError
  } = useSnapshotEventStore();

  const fetchSnapshotEventsRequest = useApiRequest<SnapshotEventApiItem[], QueryParams>(
    snapshotEventApi.getAll,
    {
      errorMessage: t('snapshotEvents.errors.load_failed')
    }
  );

  const fetchPaginatedSnapshotEventsRequest = useApiRequest<PaginatedResponse<SnapshotEventApiItem>, QueryParams>(
    snapshotEventApi.getPaginated,
    {
      successMessage: t('snapshotEvents.success.loaded'),
      errorMessage: t('snapshotEvents.errors.load_failed')
    }
  );

  const fetchSnapshotEventByIdRequest = useApiRequest<SnapshotEventApiItem, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return snapshotEventApi.getById(id);
    },
    {
      errorMessage: t('snapshotEvents.errors.load_single_failed')
    }
  );

  const createSnapshotEventRequest = useApiRequest<SnapshotEventApiItem, SnapshotEventDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return snapshotEventApi.create(params);
    },
    {
      successMessage: t('snapshotEvents.success.created'),
      errorMessage: t('snapshotEvents.errors.create_failed')
    }
  );


  // Getter functions for store data
  const getStoreSnapshotEvents = () => snapshotEvents || [];
  const getSelectedSnapshotEventId = () => selectedSnapshotEventId;

  return {
    // Store data
    snapshotEvents,
    loading,
    error,
    pagination,
    selectedSnapshotEventId,
    
    // Store actions
    storeFetchSnapshotEvents,
    setSelectedSnapshotEventId,
    resetError,
    
    // Getter functions
    getStoreSnapshotEvents,
    getSelectedSnapshotEventId,
    
    // API Request objects
    fetchSnapshotEventsRequest,
    fetchPaginatedSnapshotEventsRequest,
    fetchSnapshotEventByIdRequest,
    createSnapshotEventRequest,
  };
};
