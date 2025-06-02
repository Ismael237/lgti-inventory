import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useProducts } from '@hooks/use-products';
import { useStockSnapshots } from '@hooks/use-stock-snapshots';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import { formatDateWithFallback, formatEURwithXAF, formatUserFullName } from '@utils/format';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';
import { usePriceSimulations } from '@hooks/use-price-simulations';
import { useMovements } from '@hooks/use-movements';
import { DataTable, type Column } from '@ui/data-table';
import { MovementType, type Movement, type PriceSimulation } from '@entities';
import { getTypeColor } from '@utils/display-helpers';

const ProductDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchProductByIdRequest
  } = useProducts();

  const {
    fetchMovementsByProductRequest
  } = useMovements();

  const {
    fetchPaginatedPriceSimulationsRequest
  } = usePriceSimulations();

  const {
    fetchByProductIdRequest
  } = useStockSnapshots();

  const {
    execute: fetchProductById,
    data: product,
    error,
    isLoading
  } = fetchProductByIdRequest;

  const {
    execute: fetchMovementsByProduct,
    data: movements,
    isLoading: movementsLoading
  } = fetchMovementsByProductRequest;

  const {
    execute: fetchPaginatedPriceSimulations,
    data: priceSimulations,
    isLoading: priceSimulationLoading
  } = fetchPaginatedPriceSimulationsRequest;

  const {
    execute: fetchProductSnapshots,
    data: productSnapshots,
    isLoading: snapshotLoading
  } = fetchByProductIdRequest;

  const [movementsPage, setMovementsPage] = useState(1);
  const [movementsPageSize] = useState(5);

  const [simulationsPage, setSimulationsPage] = useState(1);
  const [simulationsPageSize] = useState(5);

  useEffect(() => {
    if (id) {
      const productId = Number(id);
      fetchProductById(productId);
      fetchMovementsByProduct({
        productId,
        params: {
          page: movementsPage,
          limit: movementsPageSize
        }
      });
      fetchPaginatedPriceSimulations({
        page: simulationsPage,
        limit: simulationsPageSize
      });
      fetchProductSnapshots(productId);
    }

  }, [id]);

  const getStockLevelColor = (quantity: number | null | undefined): string => {
    if (quantity === undefined || quantity === null) return "gray";
    if (quantity <= 0) return "red";
    if (quantity < 10) return "yellow";
    return "green";
  };

  const latestSnapshot = productSnapshots && productSnapshots.length > 0 ?
    productSnapshots[0] : null;

  if ((isLoading || snapshotLoading) && !product) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchProductById(Number(id))} />;
  }

  if (!product) {
    return <Box>{t('products.details.not_found')}</Box>;
  }

  const movementColumns: Column<Movement>[] = [
    {
      header: t('products.details.movement_type'),
      accessor: (row) => {
        const typeColors = {
          'IN': 'green',
          'OUT': 'red',
        };
        return <Badge colorPalette={getTypeColor(row.type, typeColors)}>{row.type}</Badge>;
      }
    },
    {
      header: t('products.details.movement_quantity'),
      accessor: (row) => (
        <Badge colorPalette={row.type === MovementType.IN ? 'green' : 'red'}>
          {row.quantity}
        </Badge>
      )
    },
    {
      header: t('products.details.movement_date'),
      accessor: (row) => formatDateWithFallback(row.date_created)
    },
  ];

  const simulationColumns: Column<PriceSimulation>[] = [
    {
      header: t('products.details.simulation_name'),
      accessor: (row) => row.scenario_name
    },
    {
      header: t('products.details.simulation_factor'),
      accessor: (row) => row.factor
    },
    {
      header: t('products.details.simulation_price'),
      accessor: (row) => {
        const simulatedPrice = product?.unit_price_eur * row.factor;
        return formatEURwithXAF(simulatedPrice);
      }
    },
  ];

  return (
    <Stack gap={4}>
      <Box>
        <Stack gap={4}>
          <Heading as="h2" size="lg">{product.reference}</Heading>

          {product.description && (
            <Text color="gray.600">{product.description}</Text>
          )}

          <SimpleGrid columns={[1, 3]} gap={6}>
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.general_info')}</Heading>
              <DataListRoot>

                <DataListItem
                  label={t('products.details.reference')}
                  value={product.reference}
                  info={t('products.details.reference_info')}
                />

                <DataListItem
                  label={t('products.details.part_number')}
                  value={product.part_number || t('products.details.not_specified')}
                />

                <DataListItem
                  label={t('products.details.category')}
                  value={
                    product.category_id ? (
                      <Text>{product.category_id.name}</Text>
                    ) : (
                      <Badge colorPalette="gray">{t('products.details.uncategorized')}</Badge>
                    )
                  }
                />

                <DataListItem
                  label={t('products.details.id')}
                  value={product.id}

                />
              </DataListRoot>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.stock_price')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('products.details.unit_price')}
                  value={formatEURwithXAF(product.unit_price_eur)}
                  info={t('products.details.unit_price_info')}
                />

                <DataListItem
                  label={t('products.details.current_stock')}
                  value={
                    product.current_stock ? (
                      <Badge colorPalette={getStockLevelColor(product.current_stock)}>
                        {product.current_stock}
                      </Badge>
                    ) : (
                      <Badge colorPalette="gray">{t('products.details.not_available')} = 0</Badge>
                    )
                  }
                  info={t('products.details.stock_quantity_info')}
                />

                {latestSnapshot && (
                  <DataListItem
                    label={t('products.details.last_stock_snapshot')}
                    value={formatDateWithFallback(latestSnapshot.snapshot_event_id.date_created)}
                  />
                )}
              </DataListRoot>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.metadata')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('products.details.created_at')}
                  value={formatDateWithFallback(product.date_created)}
                />

                <DataListItem
                  label={t('products.details.created_by')}
                  value={formatUserFullName(product.user_created)}
                />

                <DataListItem
                  label={t('products.details.last_updated')}
                  value={product.date_updated ? formatDateWithFallback(product.date_updated) : t('products.details.never')}
                />

                <DataListItem
                  label={t('products.details.updated_by')}
                  value={product.user_updated ? formatUserFullName(product.user_updated) : t('products.details.na')}
                />
              </DataListRoot>
            </Box>
          </SimpleGrid>

          <Flex gap={4} flexDirection="column">
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.movements_title')}</Heading>
              {movementsLoading ? (
                <LoadingSpinner size="sm" />
              ) : movements?.data && movements.data.length > 0 ? (
                <DataTable
                  columns={movementColumns}
                  data={movements.data}
                  total={movements.meta?.total_count || 0}
                  pageSize={movementsPageSize}
                  currentPage={movementsPage}
                  onPageChange={setMovementsPage}
                  keyExtractor={(item) => item.id}
                  emptyMessage={t('products.details.no_movements')}
                />
              ) : (
                <Text color="gray.500">{t('products.details.no_movements')}</Text>
              )}
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.price_simulations_title')}</Heading>
              {priceSimulationLoading ? (
                <LoadingSpinner size="sm" />
              ) : priceSimulations?.data && priceSimulations.data.length > 0 ? (
                <DataTable
                  columns={simulationColumns}
                  data={priceSimulations.data}
                  total={priceSimulations.data.length}
                  pageSize={simulationsPageSize}
                  currentPage={simulationsPage}
                  onPageChange={setSimulationsPage}
                  keyExtractor={(item) => item.id}
                  emptyMessage={t('products.details.no_price_simulations')}
                />
              ) : (
                <Text color="gray.500">{t('products.details.no_price_simulations')}</Text>
              )}
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('products.details.stock_history')}</Heading>
              {snapshotLoading ? (
                <LoadingSpinner size="sm" />
              ) : productSnapshots && productSnapshots.length > 0 ? (
                <Box borderWidth="1px" borderRadius="md">
                  <Flex direction="column" gap={2}>
                    <Flex
                      justify="space-between"
                      bg="bg.muted"
                      borderBottomWidth="1px"
                      pb={2}
                      p={3}
                    >
                      <Text fontWeight="bold">{t('products.details.date')}</Text>
                      <Text fontWeight="bold">{t('products.details.quantity')}</Text>
                    </Flex>
                    {productSnapshots.slice(0, 5).map((snapshot, index) => (
                      <Flex pb={2} px={3} key={index} justify="space-between" borderBottomWidth={index < 4 ? "1px" : "0"}>
                        <Text>{formatDateWithFallback(snapshot.snapshot_event_id.date_created)}</Text>
                        <Badge colorPalette={getStockLevelColor(snapshot.quantity)}>
                          {snapshot.quantity}
                        </Badge>
                      </Flex>
                    ))}
                    {productSnapshots.length > 5 && (
                      <Text pb={2} fontSize="sm" color="gray.500" textAlign="center">
                        + {productSnapshots.length - 5} {t('products.details.other_entries')}
                      </Text>
                    )}
                  </Flex>
                </Box>
              ) : (
                <Text color="gray.500">{t('products.details.no_product')}</Text>
              )}
            </Box>
          </Flex>

        </Stack>
      </Box>
    </Stack>
  );
};

export default ProductDetails;
