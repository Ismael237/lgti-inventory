/* eslint-disable react-hooks/exhaustive-deps */
import type { Product } from "@entities/product.types";
import { useProducts } from "@hooks/use-products";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename } from "@utils/format";
import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProductExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const ProductExport: FC<ProductExportProps> = ({
  redirectPath = '/products',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchPaginatedProductsRequest } = useProducts();
  const { data: products, execute: fetchPaginatedProducts } = fetchPaginatedProductsRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const columns: ColumnExportConfig<Product>[] = [
    { header: t('products.export.columns.id'), accessor: 'id' },
    { header: t('products.export.columns.reference'), accessor: 'reference' },
    { header: t('products.export.columns.description'), accessor: (p: Product) => p.description || '' },
    { header: t('products.export.columns.partNumber'), accessor: (p: Product) => p.part_number || '' },
    { header: t('products.export.columns.unitPrice'), accessor: 'unit_price_eur' },
    { header: t('products.export.columns.category'), accessor: (p: Product) => p.category_id?.name || t('products.export.columns.uncategorized') },
    { header: t('products.export.columns.currentStock'), accessor: (p: Product) => p.current_stock || 0 },
    { header: t('products.export.columns.createdBy'), accessor: (p: Product) => p.user_created?.email || p.user_created?.first_name || '' },
    { header: t('products.export.columns.createdDate'), accessor: (p: Product) => p.date_created || '' },
    { header: t('products.export.columns.lastUpdatedBy'), accessor: (p: Product) => p.user_updated?.email || p.user_updated?.first_name || '' },
    { header: t('products.export.columns.lastUpdatedDate'), accessor: (p: Product) => p.date_updated || '' }
  ];

  // Fetch products on mount
  useEffect(() => {
    if (!products || products.data.length === 0) {
      fetchPaginatedProducts();
    }
  }, []);

  // Trigger export when products are loaded
  useEffect(() => {
    if (products?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [products]);

  const exportData = async () => {
    if (!products || products.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `products-export-${formattedDate}.csv`;

      exportToCsv<Product>(columns, products.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('products.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting products:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('products.export.loading')} />
  );
};