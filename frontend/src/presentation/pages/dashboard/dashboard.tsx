import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
  Flex,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import {
  LuPackage,
  LuTags,
  LuArrowUpDown,
  LuArrowUpRight,
  LuArrowDownRight,
  LuDollarSign,
} from 'react-icons/lu';
import { useProducts } from '@hooks/use-products';
import { useCategories } from '@hooks/use-categories';
import { useMovements } from '@hooks/use-movements';
import { MovementType } from '@entities/movement.types';
import { truncateText } from '@utils/format';
import ToggleableValue from '@ui/toggleable-value';
import StatCard from '@ui/stat-card';



interface RecentActivityCardProps {
  title: string;
  items: React.ReactNode[];
  loading: boolean;
  emptyMessage: string;
  icon: React.ComponentType;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ title, items, loading, emptyMessage, icon }) => {
  return (
    <Box
      p="4"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="white"
      _dark={{ bg: 'gray.800' }}
    >
      <VStack gap="4" align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="md">{title}</Heading>
          <Icon as={icon} boxSize="4" color="fg.muted" />
        </Flex>

        {loading ? (
          <Flex justify="center" py="4">
            <Spinner />
          </Flex>
        ) : items.length === 0 ? (
          <Text color="fg.muted" py="4" textAlign="center">{emptyMessage}</Text>
        ) : (
          <VStack gap="3" align="stretch">
            {items.map((item, index, array) => (
              <Box key={index}>
                {item}
                {index < array.length - 1 && <Box w="full" bg="gray.200" h="1px" mt="3" />}
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalMovements: 0,
    stockValue: 0
  });

  const [recentMovements, setRecentMovements] = useState<React.ReactNode[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<React.ReactNode[]>([]);

  const {
    fetchPaginatedProductsRequest,
  } = useProducts();

  const {
    data: products,
    isLoading: productsLoading,
    execute: fetchPaginatedProducts,
  } = fetchPaginatedProductsRequest;

  const {
    fetchPaginatedCategoriesRequest
  } = useCategories();

  const {
    data: categories,
    execute: fetchPaginatedCategories,
    isLoading: categoriesLoading
  } = fetchPaginatedCategoriesRequest;

  const {
    fetchPaginatedMovementsRequest
  } = useMovements();

  const {
    isLoading: movementsLoading,
    data: movements,
    execute: fetchPaginatedMovement
  } = fetchPaginatedMovementsRequest;

  useEffect(() => {
    fetchPaginatedProducts();
    fetchPaginatedCategories({
      limit: 5,
    });
    fetchPaginatedMovement({
      limit: 5,
    });

  }, []);

  useEffect(() => {
    if (products && categories && movements) {
      const stockValue = products?.data.reduce((total, product) => {
        return total + (product.current_stock || 0) * product.unit_price_eur;
      }, 0) || 0;

      setStats({
        totalProducts: products?.meta.total_count || 0,
        totalCategories: categories?.meta.total_count || 0,
        totalMovements: movements?.meta.total_count || 0,
        stockValue
      });

      const sortedMovements = [...(movements.data || [])].sort((a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      ).slice(0, 5);

      setRecentMovements(sortedMovements.map(movement => (
        <Flex justify="space-between" align="center">
          <Stack gap="1">
            <Text fontWeight="medium">
              {movement.product_id?.reference || t('dashboard.unknown_product')}
            </Text>
            <Flex align="center" gap="1">
              <Icon
                as={movement.type === MovementType.IN ? LuArrowUpRight : LuArrowDownRight}
                color={movement.type === MovementType.IN ? "green.500" : "red.500"}
              />
              <Text fontSize="sm" color="fg.subtle">
                {movement.type === MovementType.IN ? t('dashboard.stock_in') : t('dashboard.stock_out')}: {movement.quantity}
              </Text>
            </Flex>
          </Stack>
          <Text fontSize="sm" color="fg.subtle">
            {new Date(movement.date_created).toLocaleDateString()}
          </Text>
        </Flex>
      )));

      // Get low stock products (less than 10 items)
      const lowStock = products.data
        ?.filter(product => (product.current_stock || 0) < 10)
        .sort((a, b) => (a.current_stock || 0) - (b.current_stock || 0))
        .slice(0, 5)
        .map(product => (
          <Flex justify="space-between" align="center">
            <Stack gap="1">
              <Text fontWeight="medium">{product.reference}</Text>
              <Text fontSize="sm" color="fg.subtle">
                {truncateText(product.description, 30, t('dashboard.no_description'))}
              </Text>
            </Stack>
            <Text
              fontWeight="bold"
              color={(product.current_stock || 0) < 5 ? "red.500" : "orange.500"}
            >
              {product.current_stock || 0} {t('dashboard.units')}
            </Text>
          </Flex>
        )) || [];

      setLowStockProducts(lowStock);
    }
  }, [products, categories, movements, t]);

  return (
    <VStack gap="4" width="full" align="stretch">
      <Heading size="lg">{t('dashboard.title')}</Heading>

      <Grid templateColumns={["1fr", null, null, "1.3fr 1fr 1fr 1fr"]} gap="4">
        <StatCard
          title={t('dashboard.stock_value')}
          value={<ToggleableValue
            value={stats.stockValue}
            storageKey="showStockValue"
          />}
          icon={LuDollarSign}
          loading={productsLoading}
          colorPalette="brand"
        />
        <StatCard
          title={t('dashboard.total_products')}
          value={stats.totalProducts}
          icon={LuPackage}
          loading={productsLoading}
          colorPalette="orange"
        />
        <StatCard
          title={t('dashboard.total_categories')}
          value={stats.totalCategories}
          icon={LuTags}
          loading={categoriesLoading}
          colorPalette="purple"
        />
        <StatCard
          title={t('dashboard.total_movements')}
          value={stats.totalMovements}
          icon={LuArrowUpDown}
          loading={movementsLoading}
          colorPalette="green"
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap="4">
        <RecentActivityCard
          title={t('dashboard.recent_movements')}
          items={recentMovements}
          loading={movementsLoading}
          emptyMessage={t('dashboard.no_recent_movements')}
          icon={LuArrowUpDown}
        />

        <RecentActivityCard
          title={t('dashboard.low_stock_products')}
          items={lowStockProducts}
          loading={productsLoading}
          emptyMessage={t('dashboard.no_low_stock')}
          icon={LuPackage}
        />
      </Grid>
    </VStack>
  );
};

export default Dashboard;