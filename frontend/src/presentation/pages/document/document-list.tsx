import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuFileText, LuPlus } from 'react-icons/lu';

import { useDocuments } from '@hooks/use-documents';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { CrudActionMenuCell } from '@ui/crud-action-menu-cell';
import { formatDateWithFallback, formatXAFCurrency } from '@utils/format';
import type { Document } from '@entities';
import { DocumentType, DocumentViewType as ViewType } from '@entities';
import { LinkButton } from '@ui/link-button';
import { ExportButton } from '@ui/export-button';
import { ActionMenu } from '@ui/action-menu';
import type { ContextMenuConfig } from '@ui/context-menu';

interface DocumentListComponentProps {
  viewType?: ViewType;
}

const DocumentList = ({ viewType }: DocumentListComponentProps) => {
  const { t } = useTranslation();
  const baseUrl = "/documents";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useBreakpointValue([true, null, null, false]);

  const {
    storeFetchDocuments: fetchDocuments,
    getStoreDocuments,
    loading,
    error,
    pagination,
  } = useDocuments();

  const documents = getStoreDocuments();

  const additionalOptions = (id: string | number) => ([
    {
      label: t('documents.list.view_pdf'),
      to: `${baseUrl}/${id}/pdf`,
      icon: <LuFileText size={16} />
    }
  ])

  const contextMenuConfig: ContextMenuConfig<Document> = {
    viewUrl: ({ id }) => `${baseUrl}/${id}`,
    editUrl: ({ id }) => `${baseUrl}/${id}/edit`,
    deleteUrl: ({ id }) => `${baseUrl}/${id}/delete`,
    additionalOptions: ({ id }) => additionalOptions(id),
  };

  const columns: Column<Document>[] = [
    {
      header: t('documents.list.columns.reference'),
      accessor: 'reference',
    },
    {
      header: t('documents.list.columns.type'),
      accessor: (document: Document) => {
        return (
          <Badge colorPalette={document.type === DocumentType.INVOICE ? 'green' : 'blue'}>
            {t(`documents.types.${document.type.toLowerCase()}`)}
          </Badge>
        )
      },
    },
    {
      header: t('documents.list.columns.client'),
      accessor: 'client_name',
    },
    {
      header: t('documents.list.columns.date'),
      accessor: (document: Document) => formatDateWithFallback(document.date_document, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).toUpperCase()
    },
    {
      header: t('documents.list.columns.total'),
      accessor: (document: Document) => formatXAFCurrency(document.total_ht),
    },
    {
      header: t('common.actions'),
      accessor: ({ id }: Document) => (
        <CrudActionMenuCell
          viewUrl={`${baseUrl}/${id}`}
          editUrl={`${baseUrl}/${id}/edit`}
          deleteUrl={`${baseUrl}/${id}/delete`}
          additionalOptions={additionalOptions(id)}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchDocuments({
      page,
      limit: pageSize
    });
  }, [fetchDocuments, page, pageSize]);

  if (loading && (!documents || documents.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('documents.list.title')}</Heading>
        {isMobile ? (
          <ActionMenu
            addUrl={`${baseUrl}/create`}
            baseUrl={baseUrl}
            addLabel={t('documents.list.add_document')}
            isLoading={loading}
          />
        ) : (
          <Flex gap={3}>
            <ExportButton
              baseUrl={baseUrl}
            />
            <LinkButton
              loading={loading}
              to={`${baseUrl}/create`}
            >
              <LuPlus />
              {t('documents.list.add_document')}
            </LinkButton>
          </Flex>
        )}
      </Flex>

      {error && viewType === ViewType.LIST && <ErrorDisplay error={error.message} onRetry={() => fetchDocuments()} />}

      <DataTable<Document>
        columns={columns}
        data={documents}
        total={pagination?.total || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(document) => document.id}
        emptyMessage={t('documents.list.no_documents')}
        enableContextMenu={true}
        contextMenuConfig={contextMenuConfig}
      />
    </Box>
  );
};

export default DocumentList;
