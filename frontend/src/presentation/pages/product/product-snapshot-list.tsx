import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  Badge,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Text,
  Stack,
  CardRoot,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LuPlus, LuEye, LuCalendar } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';

import { useSnapshotEvents } from '@hooks/use-snapshot-events';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import { Button } from '@ui/chakra/button';
import { LinkButton } from '@ui/link-button';
export const ProductSnapshotList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    storeFetchSnapshotEvents,
    getStoreSnapshotEvents,
    loading,
    error,
    pagination,
  } = useSnapshotEvents();

  const safeSnapshotEvents = getStoreSnapshotEvents();

  useEffect(() => {
    storeFetchSnapshotEvents({
      page,
      limit: pageSize
    });

  }, [page, pageSize]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="md">{t('products.snapshots.list.title')}</Heading>
        <LinkButton
          to="/products/snapshots/create"
        >
          <LuPlus />
          {t('products.snapshots.list.create_button')}
        </LinkButton>
      </Flex>

      {error && <ErrorDisplay error={error.message} onRetry={() => storeFetchSnapshotEvents({ page, limit: pageSize })} />}

      {safeSnapshotEvents && safeSnapshotEvents.length > 0 ? (
        <SimpleGrid columns={{ base: 2 }} gap={4}>
          {safeSnapshotEvents.map((snapshot) => (
            <CardRoot key={snapshot.id} size="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="sm">{t('products.snapshots.list.snapshot_number', { id: snapshot.id })}</Heading>
                  <Badge colorPalette="brand">
                    <Flex align="center" gap={1}>
                      <LuCalendar size={14} />
                      {formatDateWithFallback(snapshot.date_created)}
                    </Flex>
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <Stack gap={2}>
                  {/* <Flex justify="space-between">
                    <Text fontWeight="bold">{t('products.snapshots.list.products_count')}:</Text>
                    <Text>{snapshot.}</Text>
                  </Flex> */}
                  <Flex justify="space-between">
                    <Text fontWeight="bold">{t('products.snapshots.list.created_at')}:</Text>
                    <Text>{formatDateWithFallback(snapshot.date_created)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">{t('products.snapshots.list.created_by')}:</Text>
                    <Text>{formatUserFullName(snapshot.user_created) || t('common.system')}</Text>
                  </Flex>
                </Stack>
              </CardBody>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/products/snapshots/${snapshot.id}`)}
                  width="100%"
                >
                  <LuEye />
                  {t('products.snapshots.list.view_products')}
                </Button>
              </CardFooter>
            </CardRoot>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">{t('products.snapshots.list.no_snapshots')}</Text>
          <Text fontSize="md" color="gray.400" mt={2}>{t('products.snapshots.list.create_first_snapshot')}</Text>
        </Box>
      )}

      {safeSnapshotEvents && safeSnapshotEvents.length > 0 && (
        <Flex justify="center" mt={6}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            mr={2}
          >
            {t('common.pagination.previous')}
          </Button>
          <Button
            disabled={safeSnapshotEvents.length < pageSize || page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            ml={2}
          >
            {t('common.pagination.next')}
          </Button>
        </Flex>
      )}
    </Box>
  );
};
