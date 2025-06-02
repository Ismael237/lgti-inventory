import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuDownload } from 'react-icons/lu';
import { Document, Image, Page, Text as PDFText, View, StyleSheet, PDFViewer, PDFDownloadLink, Svg, Path, Font } from '@react-pdf/renderer';

import { useDocuments } from '@hooks/use-documents';
import { useDocumentLines } from '@hooks/use-document-lines';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { formatDateWithFallback } from '@utils/format';
import { type Document as MyDocument, DocumentType } from '@entities';
import { Button } from '@ui/chakra/button';
import logo from '@assets/img/lgti.png?inline';
import Inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff'
import Inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff'
import Inter700Italic from '@fontsource/inter/files/inter-latin-700-italic.woff'

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: Inter400,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      src: Inter700,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    {
      src: Inter700Italic,
      fontWeight: 'bold',
      fontStyle: 'italic',
    }
  ]
});

// PDF styles
const styles = StyleSheet.create({
  page: {
    paddingVertical: 30,
    paddingHorizontal: 60,
    fontFamily: 'Inter',
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'column',
    gap: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  documentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8
  },
  clientBlock: {
    flexDirection: 'column',
    gap: 4,
  },
  infoBlock: {
    flexDirection: 'row',
    gap: 4,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 10,
  },
  infoValue: {
    fontSize: 10,
  },
  table: {
    marginTop: 15,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f7f7f7',
    padding: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 8,
    fontSize: 10,
    gap: 8
  },
  tableCol1: {
    width: '30%',
    textAlign: 'left',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '10%',
    textAlign: 'center',
  },
  tableCol4: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol5: {
    width: '20%',
    textAlign: 'right',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 4,
  },
  totalLabel: {
    fontWeight: 'bold',
    paddingRight: 10,
    fontSize: 10,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
  amountWords: {
    marginTop: 15,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});


const CircleCheckBigPdf = () => {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="white"
      stroke="#AE232F"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <Path d="m9 11 3 3L22 4" />
    </Svg>
  )
}

const DocumentPDF = ({ document, closeRendering }: { document: MyDocument, closeRendering: () => void }) => {
  const categories = [
    'Fournitures',
    'Techniques de l\'air comprimé',
    'Électricité',
    'Instrumentation',
    'Travaux industriels',
    'Formations',
  ]
  return (
    <Document
      language="fr"
      author="LGTI"
      title="Document"
      creator="LGTI"
      producer="LGTI"
      subject="Document"
      creationDate={new Date(document.date_document)}
      onRender={() => closeRendering()}
    >
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>
          <View>
            <Image
              src={logo}
              style={{ width: 200, height: 'auto' }}
            />
          </View>
          <View style={styles.categories}>
            {categories.map((category, i) => (
              <View key={i} style={styles.categoryItem}>
                <CircleCheckBigPdf />
                <PDFText>{category}</PDFText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.rowSpace, { marginTop: 25, marginBottom: 30 }]}>

          <View>
            <View style={styles.documentTitle}>
              <PDFText>{document.type === DocumentType.INVOICE ? 'FACTURE' : 'DEVIS'} N° {document.reference}</PDFText>
            </View>
            <View style={styles.infoBlock}>
              <PDFText style={styles.infoLabel}>Date:</PDFText>
              <PDFText style={styles.infoValue}>{formatDateWithFallback(document.date_document, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).toUpperCase()}</PDFText>
            </View>
          </View>

          <View style={styles.clientBlock}>
            <View style={styles.infoBlock}>
              <PDFText style={styles.infoLabel}>Client:</PDFText>
              <PDFText style={styles.infoValue}>{document.client_name}</PDFText>
            </View>

            {document.client_address && (
              <View style={styles.infoBlock}>
                <PDFText style={styles.infoLabel}>BP:</PDFText>
                <PDFText style={styles.infoValue}>{document.client_address}</PDFText>
              </View>
            )}

            {document.client_phone && (
              <View style={styles.infoBlock}>
                <PDFText style={styles.infoLabel}>Tél:</PDFText>
                <PDFText style={styles.infoValue}>{document.client_phone}</PDFText>
              </View>
            )}

            {document.client_niu && (
              <View style={styles.infoBlock}>
                <PDFText style={styles.infoLabel}>NIU:</PDFText>
                <PDFText style={styles.infoValue}>{document.client_niu}</PDFText>
              </View>
            )}

            {document.client_rc && (
              <View style={styles.infoBlock}>
                <PDFText style={styles.infoValue}>{document.client_rc}</PDFText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <PDFText style={styles.tableCol1}>Désignation</PDFText>
            <PDFText style={styles.tableCol2}>Référence</PDFText>
            <PDFText style={styles.tableCol4}>Prix unitaire HT</PDFText>
            <PDFText style={styles.tableCol3}>Quantité</PDFText>
            <PDFText style={styles.tableCol5}>Total HT</PDFText>
          </View>

          {document.document_line.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <PDFText style={styles.tableCol1}>{line.designation}</PDFText>
              <PDFText style={styles.tableCol2}>{line.reference || '-'}</PDFText>
              <PDFText style={styles.tableCol4}>{line.unit_price.toLocaleString()} FCFA</PDFText>
              <PDFText style={styles.tableCol3}>{line.quantity}</PDFText>
              <PDFText style={styles.tableCol5}>{line.total_price.toLocaleString()} FCFA</PDFText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
          <View style={styles.totalSection}>
            <PDFText style={styles.totalLabel}>Total HT:</PDFText>
            <PDFText style={styles.totalValue}>{document.total_ht.toLocaleString()} FCFA</PDFText>
          </View>
        </View>

        {document.amount_words && (
          <View style={styles.amountWords}>
            <PDFText>
              {document.type === DocumentType.INVOICE
                ? `Arrêté la présente facture à la somme de: ${document.amount_words}`
                : `Arrêté le présent devis à la somme de: ${document.amount_words}`
              }
            </PDFText>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 50, paddingRight: 50 }}>
          <View style={{ flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <PDFText style={{ fontSize: 10, fontWeight: 'bold', textDecoration: 'underline' }}>LA DIRECTION</PDFText>
            <PDFText style={{ fontSize: 8, textDecoration: 'underline' }}>Signature et cachet</PDFText>
          </View>
        </View>

        <View style={styles.footer}>
          <PDFText>LGTI - La Générale des Travaux Industriels</PDFText>
        </View>
      </Page>
    </Document>
  )
};

const DocumentPDFPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);

  const { open: isRendering, onClose: closeRendering } = useDisclosure({ defaultOpen: true });

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

  useEffect(() => {
    if (document && documentLines && !documentLoading && !linesLoading) {
      setIsLoaded(true);
    }
  }, [document, documentLines, documentLoading, linesLoading]);

  const handleBack = () => {
    navigate(`/documents/${id}`);
  };

  const loading = documentLoading || linesLoading;
  const error = documentError || linesError;

  if (loading || !isLoaded) {
    return <LoadingSpinner text={t('documents.pdf.loading')} />;
  }

  if (error) {
    return (
      <Box p={4}>
        <Button variant="outline" onClick={handleBack} mb={4}>
          <LuArrowLeft />{t('common.back')}
        </Button>
        <ErrorDisplay
          error={error.message}
          onRetry={() => {
            if (id) {
              fetchDocument(parseInt(id, 10));
              fetchDocumentLines({ documentId: parseInt(id, 10) });
            }
          }}
        />
      </Box>
    );
  }

  if (!document || !documentLines) {
    return (
      <Box p={4}>
        <Button variant="outline" onClick={handleBack} mb={4}>
          <LuArrowLeft />{t('common.back')}
        </Button>
        <Text>{t('documents.pdf.not_found')}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <LuArrowLeft />
          </Button>
          <Heading as="h1" size="lg">
            {t('documents.pdf.preview')}
          </Heading>
        </Flex>

        <HStack gap={4}>
          <PDFDownloadLink
            document={<DocumentPDF document={document} closeRendering={closeRendering} />}
            fileName={`${document.type === DocumentType.INVOICE ? 'Facture' : 'Devis'}-${document.reference}.pdf`}
          >
            <Button
              disabled={isRendering}
            >
              <LuDownload />
              {t('documents.pdf.download')}
            </Button>
          </PDFDownloadLink>
        </HStack>
      </Flex>

      <Box
        height="600px"
        borderWidth="1px"
        borderRadius="lg"
        borderColor="gray.200"
        overflow="hidden"
      >

        {isRendering ? (
          <LoadingSpinner text={t('documents.pdf.loading')} />
        ) : (
          <PDFViewer
            style={{ width: '100%', height: '100%' }}
          >
            <DocumentPDF document={document} closeRendering={closeRendering} />
          </PDFViewer>)
        }
      </Box>
    </Box >
  );
};

export default DocumentPDFPage;
