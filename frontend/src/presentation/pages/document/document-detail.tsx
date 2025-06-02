import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  ButtonGroup,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  useBreakpointValue,
  CardRoot, CardHeader, CardBody
} from '@chakra-ui/react';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';
import { useTranslation } from 'react-i18next';
import { LuPrinter, LuPencil, LuArrowLeft } from 'react-icons/lu';

import { useDocuments } from '@hooks/use-documents';
import { useDocumentLines } from '@hooks/use-document-lines';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { formatDateWithFallback, formatUserFullName, formatXAFCurrency } from '@utils/format';
import { DocumentType, type DocumentLine } from '@entities';
import { Button } from '@ui/chakra/button';
import { numberToWords } from '@utils/number-to-words';

const DocumentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue([true, null, null, false]);

  const { fetchDocumentByIdRequest } = useDocuments();
  const { fetchDocumentLinesByDocumentIdRequest } = useDocumentLines();

  const {
    data: document,
    isLoading: documentLoading,
    error: documentError,
    execute: fetchDocument,
  } = fetchDocumentByIdRequest;

  const {
    data: documentLines,
    isLoading: linesLoading,
    error: linesError,
    execute: fetchDocumentLines,
  } = fetchDocumentLinesByDocumentIdRequest;

  useEffect(() => {
    if (id) {
      fetchDocument(parseInt(id, 10));
      fetchDocumentLines({ documentId: parseInt(id, 10) });
    }
  }, [id]);

  const loading = documentLoading || linesLoading;
  const error = documentError || linesError;

  if (loading && !document) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchDocument(parseInt(id!, 10))} />;
  }

  if (!document) {
    return <Box p={4}>{t('documents.detail.not_found')}</Box>;
  }

  const handleEdit = () => {
    navigate(`/documents/${document.id}/edit`);
  };

  const handlePrintPdf = () => {
    navigate(`/documents/${document.id}/pdf`);
  };

  const handleBack = () => {
    navigate('/documents');
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <LuArrowLeft />
          </Button>
          <Heading as="h1" size="lg">
            {t('documents.detail.title')}
          </Heading>
        </Flex>

        <ButtonGroup>
          <Button variant="outline" onClick={handleEdit}>
            <LuPencil />
            {!isMobile && t('common.edit')}
          </Button>
          <Button onClick={handlePrintPdf}>
            <LuPrinter />
            {!isMobile && t('documents.detail.print')}
          </Button>
        </ButtonGroup>
      </Flex>

      <Flex gap={4} flexDir={["column", null, "row-reverse"]} mb={4}>

        <CardRoot size="sm">
          <CardHeader>
            <Heading size="md">{t('partners.details.metadata')}</Heading>
          </CardHeader>
          <CardBody>
            <DataListRoot flexDir={["row", null, "column"]} >
              <DataListItem
                label={t('documents.detail.created_at')}
                value={`${formatDateWithFallback(document.date_created)} par ${formatUserFullName(document.user_created)}`}
              />
              {document.user_updated && (
                <DataListItem
                  label={t('documents.detail.updated_at')}
                  value={`${formatDateWithFallback(document.date_updated)} par ${formatUserFullName(document.user_updated)}`}
                />
              )}
            </DataListRoot>
          </CardBody>
        </CardRoot>

        <CardRoot flex={2} size="sm">
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">{t('documents.detail.info')}</Heading>
              <Badge colorPalette={document.type === DocumentType.INVOICE ? 'green' : 'blue'}>
                {t(`documents.types.${document.type.toLowerCase()}`)}
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            <DataListRoot orientation="horizontal" size="lg" divideY="1px" gap={2}>
              <DataListItem
                label={t('documents.detail.reference')}
                value={document.reference}
              />
              <DataListItem
                pt={2}
                label={t('documents.detail.date')}
                value={formatDateWithFallback(document.date_document)}
              />
              <DataListItem
                pt={2}
                label={t('documents.detail.client')}
                value={document.client_name}
              />
              {document.client_address && (
                <DataListItem
                  pt={2}
                  label={t('documents.detail.client_address')}
                  value={document.client_address}
                />
              )}
              {document.client_phone && (
                <DataListItem
                  pt={2}
                  label={t('documents.detail.client_phone')}
                  value={document.client_phone}
                />
              )}
              {document.client_niu && (
                <DataListItem
                  pt={2}
                  label={t('documents.detail.client_niu')}
                  value={document.client_niu}
                />
              )}
              {document.client_rc && (
                <DataListItem
                  pt={2}
                  label={t('documents.detail.client_rc')}
                  value={document.client_rc}
                />
              )}
            </DataListRoot>

            {document.notes && (
              <Box mt={4}>
                <Text fontWeight="bold">{t('documents.detail.notes')}</Text>
                <Text mt={1}>{document.notes}</Text>
              </Box>
            )}
          </CardBody>
        </CardRoot>
      </Flex>


      <CardRoot size="sm">
        <CardHeader>
          <Heading size="md">{t('documents.detail.lines')}</Heading>
        </CardHeader>
        <CardBody>
          {documentLines && documentLines.length > 0 ? (
            <Stack gap={0}>
              <Flex
                p={3}
                bg="bg.subtle"
                fontWeight="medium"
                direction={{ base: 'column', md: 'row' }}
                display={{ base: 'none', md: 'flex' }}
              >
                <Box flex="1">{t('documents.detail.designation')}</Box>
                <Box flex="1" textAlign="center">{t('documents.detail.reference')}</Box>
                <Box flex="1" textAlign="center">{t('documents.detail.quantity')}</Box>
                <Box flex="1" textAlign="center">{t('documents.detail.unit_price')}</Box>
                <Box flex="1" textAlign="right">{t('documents.detail.total')}</Box>
              </Flex>

              {documentLines.map((line: DocumentLine) => (
                <Box key={line.id} borderTopWidth={1}>
                  <Flex
                    p={3}
                    border="1px"
                    borderColor="border.subtle"
                    borderRadius="md"
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 2, md: 0 }}
                  >
                    <Box flex="1">
                      {isMobile && <Text fontWeight="medium">{t('documents.detail.designation')}:</Text>}
                      <Text>{line.designation}</Text>
                    </Box>
                    <Box flex="1" textAlign={{ base: 'left', md: 'center' }}>
                      {isMobile && <Text fontWeight="medium">{t('documents.detail.reference')}:</Text>}
                      <Text>{line.reference || '-'}</Text>
                    </Box>
                    <Box flex="1" textAlign={{ base: 'left', md: 'center' }}>
                      {isMobile && <Text fontWeight="medium">{t('documents.detail.quantity')}:</Text>}
                      <Text>{line.quantity}</Text>
                    </Box>
                    <Box flex="1" textAlign={{ base: 'left', md: 'center' }}>
                      {isMobile && <Text fontWeight="medium">{t('documents.detail.unit_price')}:</Text>}
                      <Text>{formatXAFCurrency(line.unit_price)}</Text>
                    </Box>
                    <Box flex="1" textAlign={{ base: 'left', md: 'right' }}>
                      {isMobile && <Text fontWeight="medium">{t('documents.detail.total')}:</Text>}
                      <Text fontWeight="bold">{formatXAFCurrency(line.total_price)}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}

              <Flex justify="space-between" borderTopWidth={1} gap={8} pt={4}>
                {document.total_ht && (
                  <Box fontSize="sm" fontStyle="italic">
                    <Text fontWeight="medium">{t('documents.detail.amount_words')}:</Text>
                    <Text>{numberToWords(Math.round(document.total_ht)).toLocaleUpperCase() + ' FCFA'}</Text>
                  </Box>
                )}
                <Flex justify="space-between" fontWeight="medium" gap={[4, null, 24]}>
                  <Text>{t('documents.detail.total_ht')} :</Text>
                  <Text fontWeight="bold">{formatXAFCurrency(document.total_ht)}</Text>
                </Flex>
              </Flex>
            </Stack>
          ) : (
            <Text color="fg.muted">{t('documents.detail.no_lines')}</Text>
          )}
        </CardBody>
      </CardRoot>
    </Box>
  );
};

export default DocumentDetail;
