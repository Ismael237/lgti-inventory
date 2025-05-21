/* eslint-disable react-hooks/exhaustive-deps */
import type { StockSnapshot } from "@entities/stock-snapshot.types";
import { useStockSnapshots } from "@hooks/use-stock-snapshots";
import { useSnapshotEvents } from "@hooks/use-snapshot-events";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename } from "@utils/format";
import { useEffect, useState, type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProductSnapshotExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const ProductSnapshotExport: FC<ProductSnapshotExportProps> = ({
  redirectPath = '/products/snapshots',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snapshotId } = useParams<{ snapshotId: string }>();
  const { fetchSnapshotEventByIdRequest } = useSnapshotEvents();
  const { fetchBySnapshotEventIdRequest } = useStockSnapshots();
  
  const { data: snapshot, execute: fetchSnapshotEventById } = fetchSnapshotEventByIdRequest;
  const { data: stockSnapshotsResponse, execute: fetchBySnapshotEventId } = fetchBySnapshotEventIdRequest;
  const stockSnapshots = stockSnapshotsResponse?.data || [];
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const columns: ColumnExportConfig<StockSnapshot>[] = [
    { header: t('common.id'), accessor: 'id' },
    { header: t('products.snapshots.details.columns.reference'), accessor: (s: StockSnapshot) => s.product_id.reference || '' },
    { header: t('products.form.description'), accessor: (s: StockSnapshot) => s.product_id.description || '' },
    { header: t('products.form.part_number'), accessor: (s: StockSnapshot) => s.product_id.part_number || '' },
    { header: t('products.snapshots.details.columns.snapshotted_price'), accessor: 'unit_price_eur' },
    { header: t('products.form.category'), accessor: (s: StockSnapshot) => s.product_id.category_id?.name || t('products.list.uncategorized') },
    { header: t('products.snapshots.details.columns.snapshotted_quantity'), accessor: 'quantity' },
    { header: t('products.snapshots.details.columns.actual_quantity'), accessor: (s: StockSnapshot) => s.product_id.current_stock || 0 },
    { header: t('common.created_at'), accessor: () => new Date().toISOString() },
    { header: t('common.created_by'), accessor: () => 'N/A' }
  ];

  // Fetch snapshot and stock snapshots on mount
  useEffect(() => {
    if (snapshotId) {
      const id = Number(snapshotId);
      fetchSnapshotEventById(id);
      fetchBySnapshotEventId(id);
    }
  }, [snapshotId]);

  // Trigger export when stock snapshots are loaded
  useEffect(() => {
    if (stockSnapshots.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [stockSnapshots]);

  const exportData = async () => {
    if (!stockSnapshots || stockSnapshots.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const snapshotLabel = snapshot?.label || snapshotId;
      const filename = `snapshot-${snapshotLabel}-export-${formattedDate}.csv`;

      exportToCsv<StockSnapshot>(columns, stockSnapshots, filename);
      await new Promise(res => setTimeout(res, 300));

      if (redirectPath) {
        navigate(`${redirectPath}/${snapshotId}`, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('products.snapshots.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting snapshot products:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <LoadingSpinner text={t('products.snapshots.export.loading')} />
  );
};
