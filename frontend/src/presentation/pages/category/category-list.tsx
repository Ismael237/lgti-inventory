import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuFolderTree } from 'react-icons/lu';

import { useCategories } from '@hooks/use-categories';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import { CategoryViewType, type Category } from '@entities';
import { getCategoryBadge } from '@utils/display-helpers';
import { ExportButton } from '@ui/export-button';
import { LinkButton } from '@ui/link-button';
import { ActionMenu } from '@ui/action-menu';

interface CategoryListComponentProps {
  viewType?: CategoryViewType;
}


const CategoriesList = ({ viewType }: CategoryListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/categories";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchCategories: fetchCategories,
    getStoreCategories,
    loading,
    error,
    pagination,
  } = useCategories();

  const categories = getStoreCategories();

  useEffect(() => {
    fetchCategories({
      page,
      limit: pageSize
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const columns: Column<Category>[] = [
    {
      header: t('categories.list.columns.name'),
      accessor: 'name',
    },
    {
      header: t('categories.list.columns.parent'),
      accessor: (category: Category) => getCategoryBadge(category),
    },
    {
      header: t('categories.list.columns.created_at'),
      accessor: (category: Category) => formatDateWithFallback(category.date_created),
    },
    {
      header: t('categories.list.columns.created_by'),
      accessor: (category: Category) => formatUserFullName(category.user_created),
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: Category) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
        />
      ),
    },
  ];

  if (loading && (!categories || categories.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('categories.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            baseUrl={baseUrl}
            addLabel={t('categories.list.add_category')}
            items={[
              {
                label: t('categories.list.view_hierarchy'),
                icon: <LuFolderTree />,
                to: `${baseUrl}/hierarchy`,
                color: "brand.600"
              },
            ]}
            isLoading={loading}
          />
        ) : (
          <Flex gap={3}>
            <ExportButton
              baseUrl={baseUrl}
            />
            <LinkButton
              variant="outline"
              to={`${baseUrl}/hierarchy`}
            >
              <LuFolderTree />
              {t('categories.list.view_hierarchy')}
            </LinkButton>
            <LinkButton
              loading={loading}
              to={`${baseUrl}/new`}
            >
              <LuPlus />
              {t('categories.list.add_category')}
            </LinkButton>
          </Flex>
        )}
      </Flex>
        {error && viewType === CategoryViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchCategories()} />}

        <DataTable<Category>
          columns={columns}
          data={categories}
          total={pagination?.total || 0}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          keyExtractor={(category) => category.id}
          emptyMessage={t('categories.list.no_categories')}
        />
    </Box>
  );
};

export default CategoriesList;