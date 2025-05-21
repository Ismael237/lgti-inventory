import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  Stack,
  HStack,
  Icon
} from '@chakra-ui/react';
import { LuCalendar } from 'react-icons/lu';

import { useSnapshotEvents } from '@hooks/use-snapshot-events';
import { useStockSnapshots } from '@hooks/use-stock-snapshots';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { formatEURwithXAF, formatDateWithFallback } from '@utils/format';
import type { StockSnapshot } from '@entities/stock-snapshot.types';
import { Alert } from '@ui/chakra/alert';
import { ExportButton } from '@ui/export-button';
import { BackButton } from '@ui/back-button';

export const ProductSnapshotDetails = () => {
  const { t } = useTranslation();
  const { snapshotId } = useParams<{ snapshotId: string }>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    fetchSnapshotEventByIdRequest,
  } = useSnapshotEvents();

  const {
    storeFetchStockSnapshots,
    getStoreStockSnapshots,
    loading: itemsLoading,
    setSelectedSnapshotEventId,
    pagination,
  } = useStockSnapshots();

  const {
    execute: fetchSnapshotEventById,
    data: snapshot,
    error,
    isLoading
  } = fetchSnapshotEventByIdRequest;

  const snapshotItems = getStoreStockSnapshots();

  useEffect(() => {
    if (snapshotId) {
      const id = Number(snapshotId);
      fetchSnapshotEventById(id);
      setSelectedSnapshotEventId(id);
      storeFetchStockSnapshots({
        page,
        limit: pageSize
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotId, page, pageSize]);

  const columns: Column<StockSnapshot>[] = [
    {
      header: t('products.snapshots.details.columns.reference'),
      accessor: (stockSnapshot: StockSnapshot) => stockSnapshot.product_id.reference,
    },
    {
      header: t('products.snapshots.details.columns.snapshotted_price'),
      accessor: (stockSnapshot: StockSnapshot) => formatEURwithXAF(stockSnapshot.unit_price_eur || 0),
    },
    {
      header: t('products.snapshots.details.columns.actual_quantity'),
      accessor: (stockSnapshot: StockSnapshot) => {
        const stockLevel = stockSnapshot.product_id.current_stock || 0;
        let color = 'gray';

        if (stockLevel <= 0) {
          color = 'red';
        } else if (stockLevel < 10) {
          color = 'orange';
        } else {
          color = 'green';
        }

        return <Badge colorPalette={color}>{stockLevel}</Badge>;
      },
    },
    {
      header: t('products.snapshots.details.columns.snapshotted_quantity'),
      accessor: (stockSnapshot: StockSnapshot) => {
        const stockLevel = stockSnapshot.quantity || 0;
        let color = 'gray';

        if (stockLevel <= 0) {
          color = 'red';
        } else if (stockLevel < 10) {
          color = 'orange';
        } else {
          color = 'green';
        }

        return <Badge colorPalette={color}>{stockLevel}</Badge>;
      },
    },
    {
      header: t('products.snapshots.details.columns.quantity_differences'),
      accessor: (stockSnapshot: StockSnapshot) => {
        const snapshotStock = stockSnapshot.quantity ?? 0;
        const currentStock = stockSnapshot.product_id.current_stock ?? 0;

        if (snapshotStock === 0) {
          return <Badge colorPalette="gray">{t('common.na')}</Badge>;
        }

        const difference = currentStock - snapshotStock;
        const percent = Math.round((difference / snapshotStock) * 100);

        let color: 'green' | 'red' | 'gray' = 'gray';
        if (percent > 0) color = 'green';
        else if (percent < 0) color = 'red';

        return (
          <Badge colorPalette={color}>
            {percent > 0 ? '+' : ''}
            {percent}%
          </Badge>
        );
      },
    },
  ];

  if (isLoading && !snapshot) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchSnapshotEventById(Number(snapshotId))} />;
  }

  if (!snapshot) {
    return <Box>{t('products.snapshots.details.not_found')}</Box>;
  }

  return (
    <Stack gap={4}>
      <BackButton w="fit-content" />
      <Alert
        colorPalette="brand"
        title={(
          <HStack justifyContent="space-between">
            <Heading as="h2" size="sm">{snapshot.label}</Heading>
            <Badge colorPalette="brand" variant="surface" size="md">
              <Flex align="center" gap={1}>
                <Icon as={LuCalendar} />
                {formatDateWithFallback(snapshot.date_created)}
              </Flex>
            </Badge>
          </HStack>
        )}
        size="sm"
      >
        {snapshot.notes && (
          <Text>{snapshot.notes}</Text>
        )}
      </Alert>
      <Box>
        <Flex justifyContent="space-between" mb={2} alignItems="center">
          <Heading as="h3" size="md">{t('products.snapshots.details.products_title')}</Heading>
          <ExportButton size="xs" baseUrl={`/products/snapshots/${snapshotId}`} />
        </Flex>

        {itemsLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <DataTable<StockSnapshot>
            columns={columns}
            data={snapshotItems}
            total={pagination?.total || 0}
            pageSize={pageSize}
            currentPage={page}
            onPageChange={setPage}
            keyExtractor={(product) => product.id}
            emptyMessage={t('products.snapshots.details.no_products')}
          />
        )}
      </Box>
    </Stack>
  );
};