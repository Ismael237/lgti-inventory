/* eslint-disable react-hooks/exhaustive-deps */
import type { Movement } from "@entities/movement.types";
import { useMovements } from "@hooks/use-movements";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename, formatDateWithFallback } from "@utils/format";
import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

interface MovementExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const MovementExport: FC<MovementExportProps> = ({
  redirectPath = '/movements',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const columns: ColumnExportConfig<Movement>[] = [
    { header: t('common.id'), accessor: 'id' },
    { header: t('movements.details.reference'), accessor: 'reference' },
    { header: t('movements.details.type'), accessor: 'type' },
    { header: t('movements.details.status'), accessor: 'status' },
    { header: t('movements.details.product'), accessor: (m: Movement) => m.product_id?.reference || '' },
    { header: t('movements.details.quantity'), accessor: 'quantity' },
    // Skip price fields as they're not available in the Movement type
    { header: t('movements.details.quantity'), accessor: (m: Movement) => m.quantity || 0 },
    { header: t('common.date'), accessor: (m: Movement) => formatDateWithFallback(m.date_created) },
    { header: t('common.created_by'), accessor: (m: Movement) => m.user_created?.email || m.user_created?.first_name || '' },
    { header: t('common.created_at'), accessor: (m: Movement) => m.date_created || '' },
    { header: t('common.updated_by'), accessor: (m: Movement) => m.user_updated?.email || m.user_updated?.first_name || '' },
    { header: t('common.last_updated'), accessor: (m: Movement) => m.date_updated || '' }
  ];

  const navigate = useNavigate();
  const { fetchPaginatedMovementsRequest } = useMovements();
  const { data: movements, execute: fetchPaginatedMovements } = fetchPaginatedMovementsRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  // Fetch movements on mount
  useEffect(() => {
    if (!movements || movements.data.length === 0) {
      fetchPaginatedMovements();
    }
  }, []);

  // Trigger export when movements are loaded
  useEffect(() => {
    if (movements?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [movements]);

  const exportData = async () => {
    if (!movements || movements.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `${t('movements.export.filename')}-${formattedDate}.csv`;

      exportToCsv<Movement>(columns, movements.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('movements.export.success_message') : undefined,
          }
        });
      }
    } catch (error) {
      console.error(t('movements.export.error_message'), error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('movements.export.loading')} />
  );
};
