/* eslint-disable react-hooks/exhaustive-deps */
import type { Category } from "@entities/category.types";
import { useCategories } from "@hooks/use-categories";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename } from "@utils/format";
import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CategoryExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const CategoryExport: FC<CategoryExportProps> = ({
  redirectPath = '/categories',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const columns: ColumnExportConfig<Category>[] = [
    { header: t('common.id'), accessor: 'id' },
    { header: t('categories.list.columns.name'), accessor: 'name' },
    { header: t('categories.details.parent_category'), accessor: (c: Category) => c.parent_id?.name || '' },
    { header: t('common.created_by'), accessor: (c: Category) => c.user_created?.email || c.user_created?.first_name || '' },
    { header: t('common.created_at'), accessor: (c: Category) => c.date_created || '' },
    { header: t('common.updated_by'), accessor: (c: Category) => c.user_updated?.email || c.user_updated?.first_name || '' },
    { header: t('common.last_updated'), accessor: (c: Category) => c.date_updated || '' }
  ];

  const navigate = useNavigate();
  const { fetchPaginatedCategoriesRequest } = useCategories();
  const { data: categories, execute: fetchPaginatedCategories } = fetchPaginatedCategoriesRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    if (!categories || categories.data.length === 0) {
      fetchPaginatedCategories();
    }
  }, []);

  // Trigger export when categories are loaded
  useEffect(() => {
    if (categories?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [categories]);

  const exportData = async () => {
    if (!categories || categories.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `${t('categories.export.filename')}-${formattedDate}.csv`;

      exportToCsv<Category>(columns, categories.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('categories.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting categories:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('categories.export.loading')} />
  );
};
