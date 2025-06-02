/* eslint-disable react-hooks/exhaustive-deps */
import type { Partner } from "@entities/partner.types";
import { usePartners } from "@hooks/use-partners";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename, formatDateWithFallback } from "@utils/format";
import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PartnerExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const PartnerExport: FC<PartnerExportProps> = ({
  redirectPath = '/partners',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchPaginatedPartnersRequest } = usePartners();
  const { data: partners, execute: fetchPaginatedPartners } = fetchPaginatedPartnersRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const columns: ColumnExportConfig<Partner>[] = [
    { header: t('partners.export.columns.id'), accessor: 'id' },
    { header: t('partners.export.columns.name'), accessor: 'name' },
    { header: t('partners.export.columns.email'), accessor: 'contact_email' },
    { header: t('partners.export.columns.types'), accessor: (p: Partner) =>
      p.partner_type && p.partner_type.length > 0
        ? p.partner_type.map(type => type.partner_type_id.type_name).join(', ')
        : t('partners.export.columns.untyped')
    },
    { header: t('partners.export.columns.createdBy'), accessor: (p: Partner) => p.user_created?.email || p.user_created?.first_name || '' },
    { header: t('partners.export.columns.createdDate'), accessor: (p: Partner) => formatDateWithFallback(p.date_created)},
    { header: t('partners.export.columns.lastUpdatedBy'), accessor: (p: Partner) => p.user_updated?.email || p.user_updated?.first_name || '' },
    { header: t('partners.export.columns.lastUpdatedDate'), accessor: (p: Partner) => formatDateWithFallback(p.date_updated) }
  ];

  // Fetch partners on mount
  useEffect(() => {
    if (!partners || partners.data.length === 0) {
      fetchPaginatedPartners();
    }
  }, []);

  // Trigger export when partners are loaded
  useEffect(() => {
    if (partners?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [partners]);

  const exportData = async () => {
    if (!partners || partners.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `partners-export-${formattedDate}.csv`;

      exportToCsv<Partner>(columns, partners.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('partners.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting partners:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('partners.export.loading')} />
  );
};
