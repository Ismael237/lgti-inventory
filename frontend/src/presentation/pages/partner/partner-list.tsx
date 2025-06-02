import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus } from 'react-icons/lu';

import { usePartners } from '@hooks/use-partners';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback } from '@utils/format';
import type { Partner } from '@entities';
import { PartnerViewType as ViewType } from '@entities';
import { LinkButton } from '@ui/link-button';
import { ExportButton } from '@ui/export-button';
import { ActionMenu } from '@ui/action-menu';
import type { ContextMenuConfig } from '@ui/context-menu';

interface PartnerListComponentProps {
  viewType?: ViewType;
}

const PartnerList = ({ viewType }: PartnerListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/partners";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchPartners: fetchPartners,
    getStorePartners,
    loading,
    error,
    pagination,
  } = usePartners();

  const partners = getStorePartners();

  const contextMenuConfig: ContextMenuConfig<Partner> = {
    viewUrl: ({ id }) => `${baseUrl}/${id}`,
    editUrl: ({ id }) => `${baseUrl}/${id}/edit`,
    deleteUrl: ({ id }) => `${baseUrl}/${id}/delete`,
  };

  const columns: Column<Partner>[] = [
    {
      header: t('partners.list.columns.name'),
      accessor: 'name',
    },
    {
      header: t('partners.list.columns.email'),
      accessor: 'contact_email',
    },
    {
      header: t('partners.list.columns.type'),
      accessor: (partner: Partner) => {
        if (!partner.partner_type || partner.partner_type.length === 0) {
          return t('partners.list.untyped');
        }

        if (partner.partner_type.length === 1) {
          return partner.partner_type[0].partner_type_id.type_name;
        }

        return partner.partner_type.map((type) => type.partner_type_id.type_name).join(', ');
      },
    },
    {
      header: t('partners.list.columns.last_updated'),
      accessor: (partner: Partner) => formatDateWithFallback(partner.date_updated)
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: Partner) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchPartners({
      page,
      limit: pageSize
    });
  }, [fetchPartners, page, pageSize]);

  if (loading && (!partners || partners.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('partners.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            baseUrl={baseUrl}
            addLabel={t('partners.list.add_partner')}
            items={[]}
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
              {t('partners.list.add_partner')}
            </LinkButton>
          </Flex>
        )}
      </Flex>

      {error && viewType === ViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchPartners()} />}

      <DataTable<Partner>
        columns={columns}
        data={partners}
        total={pagination?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(partner) => partner.id}
        emptyMessage={t('partners.list.no_partners')}
        enableContextMenu={true}
        contextMenuConfig={contextMenuConfig}
      />
    </Box>
  );
};

export default PartnerList;
