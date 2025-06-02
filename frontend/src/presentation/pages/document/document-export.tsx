/* eslint-disable react-hooks/exhaustive-deps */
import type { Document } from "@entities/document.types";
import { useDocuments } from "@hooks/use-documents";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename, formatDateWithFallback } from "@utils/format";
import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DocumentExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const DocumentExport: FC<DocumentExportProps> = ({
  redirectPath = '/documents',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchPaginatedDocumentsRequest } = useDocuments();
  const { data: documents, execute: fetchPaginatedDocuments } = fetchPaginatedDocumentsRequest;
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const columns: ColumnExportConfig<Document>[] = [
    { header: t('documents.export.columns.id'), accessor: 'id' },
    { header: t('documents.export.columns.reference'), accessor: 'reference' },
    { header: t('documents.export.columns.type'), accessor: (doc: Document) => t(`documents.types.${doc.type}`) },
    { header: t('documents.export.columns.client'), accessor: 'client_name' },
    { header: t('documents.export.columns.date'), accessor: (doc: Document) => formatDateWithFallback(doc.date_document) },
    { header: t('documents.export.columns.total'), accessor: (doc: Document) => doc.total_ht },
    { header: t('documents.export.columns.createdBy'), accessor: (doc: Document) => doc.user_created?.email || doc.user_created?.first_name || '' },
    { header: t('documents.export.columns.createdDate'), accessor: (doc: Document) => formatDateWithFallback(doc.date_created)},
    { header: t('documents.export.columns.lastUpdatedBy'), accessor: (doc: Document) => doc.user_updated?.email || doc.user_updated?.first_name || '' },
    { header: t('documents.export.columns.lastUpdatedDate'), accessor: (doc: Document) => formatDateWithFallback(doc.date_updated) }
  ];

  // Fetch documents on mount
  useEffect(() => {
    if (!documents || documents.data.length === 0) {
      fetchPaginatedDocuments();
    }
  }, []);

  // Trigger export when documents are loaded
  useEffect(() => {
    if (documents?.data.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [documents]);

  const exportData = async () => {
    if (!documents || documents.data.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      const filename = `documents-export-${formattedDate}.csv`;

      exportToCsv<Document>(columns, documents.data, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('documents.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting documents:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
      <LoadingSpinner text={t('documents.export.loading')} />
  );
};

export default DocumentExport;
