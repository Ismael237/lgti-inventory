import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import { useMovements } from '@hooks/use-movements';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import { MovementViewType, type Movement } from '@entities';
import { ExportButton } from '@ui/export-button';
import { LinkButton } from '@ui/link-button';
import { ActionMenu } from '@ui/action-menu';
import type { ContextMenuConfig } from '@ui/context-menu';

interface MovementListComponentProps {
  viewType?: MovementViewType;
}

const MovementList = ({ viewType }: MovementListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/movements";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchMovements: fetchMovements,
    getStoreMovements,
    loading,
    error,
    pagination,
  } = useMovements();

  const movements = getStoreMovements();

  useEffect(() => {
    fetchMovements({
      page,
      limit: pageSize
    });
  }, [fetchMovements, page, pageSize]);

  const contextMenuConfig: ContextMenuConfig<Movement> = {
    viewUrl: ({ id }) => `${baseUrl}/${id}`,
    editUrl: ({ id }) => `${baseUrl}/${id}/edit`,
    deleteUrl: ({ id }) => `${baseUrl}/${id}/delete`,
  };

  const columns: Column<Movement>[] = [
    {
      header: t('movements.list.columns.product_name'),
      accessor: (m) => m.product_id.reference,
    },
    {
      header: t('movements.list.columns.type'),
      accessor: (movement: Movement) => {
        const typeColors = {
          'IN': 'green',
          'OUT': 'red',
        };
        const color = typeColors[movement.type as keyof typeof typeColors] || 'gray';
        return <Badge colorPalette={color}>{movement.type}</Badge>;
      },
    },
    {
      header: t('movements.list.columns.partner'),
      accessor: (movement: Movement) => movement.partner_id?.name || t('movements.list.no_partner'),
    },
    {
      header: t('movements.list.columns.quantity'),
      accessor: 'quantity',
    },
    {
      header: t('movements.list.columns.current_stock'),
      accessor: (movement: Movement) => 
        movement.product_id.current_stock !== undefined 
          ? movement.product_id.current_stock 
          : t('products.details.not_available'),
    },
    {
      header: t('movements.list.columns.created_at'),
      accessor: (movement: Movement) => formatDateWithFallback(movement.date_created),
    },
    {
      header: t('movements.list.columns.created_by'),
      accessor: (movement: Movement) => formatUserFullName(movement.user_created),
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: Movement) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
        />
      ),
    },
  ];

  if (loading && (!movements || movements.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('movements.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            baseUrl={baseUrl}
            addLabel={t('movements.list.add_movement')}
            isLoading={loading}
          />
        ) : (
          <Flex gap={3}>
            <ExportButton
              baseUrl={baseUrl}
            />
            <LinkButton 
              loading={loading}
              to={`${baseUrl}/new`}
            >
              <LuPlus />
              {t('movements.list.add_movement')}
            </LinkButton>
          </Flex>
        )}
      </Flex>

      {error && viewType === MovementViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchMovements()} />}

      <DataTable<Movement>
        columns={columns}
        data={movements}
        total={pagination?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(movement) => movement.id}
        emptyMessage={t('movements.list.no_movements')}
        enableContextMenu={true}
        contextMenuConfig={contextMenuConfig}
      />
    </Box>
  );
};

export default MovementList;
