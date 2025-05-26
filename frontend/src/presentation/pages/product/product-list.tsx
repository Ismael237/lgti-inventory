import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuHistory } from 'react-icons/lu';

import { useProducts } from '@hooks/use-products';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback, formatEURwithXAF } from '@utils/format';
import type { Product } from '@entities';
import { ProductViewType as ViewType } from '@entities';
import { LinkButton } from '@ui/link-button';
import { ExportButton } from '@ui/export-button';
import { ActionMenu } from '@ui/action-menu';

interface ProductListComponentProps {
  viewType?: ViewType;
}

const ProductList = ({ viewType }: ProductListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/products";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchProducts: fetchProducts,
    getStoreProducts,
    loading,
    error,
    pagination,
  } = useProducts();

  const products = getStoreProducts();

  const columns: Column<Product>[] = [
    {
      header: t('products.list.columns.reference'),
      accessor: 'reference',
    },
    {
      header: t('products.list.columns.part_number'),
      accessor: 'part_number',
    },
    {
      header: t('products.list.columns.category'),
      accessor: (product: Product) => product.category_id?.name || t('products.list.uncategorized'),
    },
    {
      header: t('products.list.columns.price'),
      accessor: (product: Product) => formatEURwithXAF(product.unit_price_eur),
    },
    {
      header: t('products.list.columns.quantity'),
      accessor: (product: Product) => product.current_stock,
    },
    {
      header: t('products.list.columns.last_updated'),
      accessor: (product: Product) => formatDateWithFallback(product.date_updated)
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: Product) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchProducts({
      page,
      limit: pageSize
    });
  }, [fetchProducts, page, pageSize]);

  if (loading && (!products || products.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('products.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            baseUrl={baseUrl}
            addLabel={t('products.list.add_product')}
            items={[
              {
                label: t('products.list.view_snapshots'),
                icon: <LuHistory />,
                to: `${baseUrl}/snapshots`,
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
              to={`${baseUrl}/snapshots`}
              variant="outline"
            >
              <LuHistory />
              {t('products.list.view_snapshots')}
            </LinkButton>
            <LinkButton
              loading={loading}
              to={`${baseUrl}/new`}
            >
              <LuPlus />
              {t('products.list.add_product')}
            </LinkButton>
          </Flex>
        )}
      </Flex>

      {error && viewType === ViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchProducts()} />}

      <DataTable<Product>
        columns={columns}
        data={products}
        total={pagination?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(product) => product.id}
        emptyMessage={t('products.list.no_products')}
      />
    </Box>
  );
};

export default ProductList;
