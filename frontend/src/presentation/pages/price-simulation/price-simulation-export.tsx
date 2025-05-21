/* eslint-disable react-hooks/exhaustive-deps */
import type { PriceSimulation } from "@entities/price-simulation.types";
import { usePriceSimulations } from "@hooks/use-price-simulations";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename, formatDateWithFallback } from "@utils/format";
import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

interface PriceSimulationExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const PriceSimulationExport: FC<PriceSimulationExportProps> = ({
  redirectPath = '/price-simulations',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const columns: ColumnExportConfig<PriceSimulation>[] = [
    { header: t('common.id'), accessor: 'id' },
    { header: t('price_simulations.form.scenario_name'), accessor: 'scenario_name' },
    { header: t('price_simulations.form.factor'), accessor: (p: PriceSimulation) => `${p.factor}x` },
    { header: t('price_simulations.details.percentage_change'), accessor: (p: PriceSimulation) => {
      const percentage = (p.factor - 1) * 100;
      return `${percentage}%`;
    }},
    { header: t('common.created_by'), accessor: (p: PriceSimulation) => p.user_created?.email || p.user_created?.first_name || '' },
    { header: t('common.created_at'), accessor: (p: PriceSimulation) => formatDateWithFallback(p.date_created) },
    { header: t('common.updated_by'), accessor: (p: PriceSimulation) => p.user_updated?.email || p.user_updated?.first_name || '' },
    { header: t('common.last_updated'), accessor: (p: PriceSimulation) => formatDateWithFallback(p.date_updated) }
  ];

  const navigate = useNavigate();
  const { fetchPaginatedPriceSimulationsRequest } = usePriceSimulations();
  const { data: priceSimulations, execute: fetchPaginatedPriceSimulations } = fetchPaginatedPriceSimulationsRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  // Fetch price simulations on mount
  useEffect(() => {
    if (!priceSimulations || priceSimulations.data.length === 0) {
      fetchPaginatedPriceSimulations();
    }
  }, []);

  // Trigger export when price simulations are loaded
  useEffect(() => {
    if (priceSimulations?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [priceSimulations]);

  const exportData = async () => {
    if (!priceSimulations || priceSimulations.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `${t('price_simulations.export.filename')}-${formattedDate}.csv`;

      exportToCsv<PriceSimulation>(columns, priceSimulations.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('price_simulations.export.success_message') : undefined,
          }
        });
      }
    } catch (error) {
      console.error(t('price_simulations.export.error_message'), error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('price_simulations.export.loading')} />
  );
};
