import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import { usePriceSimulations } from '@hooks/use-price-simulations';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import type { PriceSimulation } from '@entities';
import { PriceSimulationViewType } from '@entities';
import { ExportButton } from '@ui/export-button';
import { LinkButton } from '@ui/link-button';
import { ActionMenu } from '@ui/action-menu';
import type { ContextMenuConfig } from '@ui/context-menu';

interface PriceSimulationListComponentProps {
  viewType?: PriceSimulationViewType;
}

const PriceSimulationList = ({ viewType }: PriceSimulationListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/price-simulations";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchPriceSimulations: fetchPriceSimulations,
    getStorePriceSimulations,
    loading,
    error,
    pagination,
  } = usePriceSimulations();

  const priceSimulations = getStorePriceSimulations();

  useEffect(() => {
    fetchPriceSimulations({
      page,
      limit: pageSize
    });
  }, [fetchPriceSimulations, page, pageSize]);

  const contextMenuConfig: ContextMenuConfig<PriceSimulation> = {
    viewUrl: ({ id }) => `${baseUrl}/${id}`,
    editUrl: ({ id }) => `${baseUrl}/${id}/edit`,
    deleteUrl: ({ id }) => `${baseUrl}/${id}/delete`,
  };

  const columns: Column<PriceSimulation>[] = [
    {
      header: t('price_simulations.list.columns.name'),
      accessor: 'scenario_name',
    },
    {
      header: t('price_simulations.list.columns.factor'),
      accessor: (simulation: PriceSimulation) => `${simulation.factor}x`,
    },
    {
      header: t('price_simulations.list.columns.created_at'),
      accessor: (simulation: PriceSimulation) => formatDateWithFallback(simulation.date_created),
    },
    {
      header: t('price_simulations.list.columns.created_by'),
      accessor: (simulation: PriceSimulation) => formatUserFullName(simulation.user_created),
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: PriceSimulation) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
        />
      ),
    },
  ];

  if (loading && (!priceSimulations || priceSimulations.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('price_simulations.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            baseUrl={baseUrl}
            addLabel={t('price_simulations.list.create_simulation')}
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
              {t('price_simulations.list.create_simulation')}
            </LinkButton>
          </Flex>
        )}
      </Flex>

      {error && viewType === PriceSimulationViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchPriceSimulations()} />}

      <DataTable<PriceSimulation>
        columns={columns}
        data={priceSimulations}
        total={pagination?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(simulation) => simulation.id}
        emptyMessage={t('price_simulations.list.no_simulations')}
        enableContextMenu={true}
        contextMenuConfig={contextMenuConfig}
      />
    </Box>
  );
};

export default PriceSimulationList;
