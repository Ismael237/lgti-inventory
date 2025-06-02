import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Flex,
  HStack,
  createListCollection,
  Grid,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuCalendar, LuArrowUp, LuArrowDown, LuDollarSign, LuTrendingUp } from 'react-icons/lu';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem } from '@ui/chakra/select';

import { useProducts } from '@hooks/use-products';
import { useMovements } from '@hooks/use-movements';
import { DataTable } from '@ui/data-table';
import type { Column } from '@ui/data-table';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { formatEURwithXAF } from '@utils/format';
import type { Product } from '@entities';
import { MovementType } from '@entities';
import { ExportButton } from '@ui/export-button';
import StatCard from '@ui/stat-card';
import ToggleableValue from '@ui/toggleable-value';

interface ProductMovementStat {
  product: Product;
  totalIn: number;
  totalOut: number;
  difference: number;
  totalInAmount: number;
  totalOutAmount: number;
  profitLoss: number;
}

interface MonthOption {
  value: string;
  label: string;
}

const ProductMovementStats = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    fetchPaginatedProductsRequest,
  } = useProducts();

  const {
    fetchPaginatedMovementsRequest,
    fetchMovementsRequest,
    selectedMonth,
    setSelectedMonth
  } = useMovements();

  const {
    data: paginatedProducts,
    execute: fetchPaginatedProducts,
    error: productsError,
    isLoading: productsLoading,
  } = fetchPaginatedProductsRequest;

  const {
    data: allMovements,
    execute: fetchAllMovements,
    error: allMovementsError,
    isLoading: allMovementsLoading,
  } = fetchMovementsRequest;

  const {
    data: paginatedMovements,
    execute: fetchPaginatedMovements,
    error: movementsError,
    isLoading: movementsLoading,
  } = fetchPaginatedMovementsRequest;

  const products = useMemo(() => paginatedProducts?.data || [], [paginatedProducts]);
  const movements = useMemo(() => paginatedMovements?.data || [], [paginatedMovements]);

  const monthOptions: MonthOption[] = useMemo(() => {
    const options: MonthOption[] = [{ value: 'all', label: t('common.all') }];
    
    if (allMovements && allMovements.length > 0) {
      const months = new Set<string>();
      
      allMovements.forEach(movement => {
        const date = new Date(movement.date_created);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      });
      
      Array.from(months)
        .sort((a, b) => b.localeCompare(a))
        .forEach(monthYear => {
          const [year, month] = monthYear.split('-');
          options.push({
            value: monthYear,
            label: `${t(`common.months.${parseInt(month) - 1}`)} ${year}`
          });
        });
    }
    
    return options;
  }, [allMovements, t]);

  const monthOptionsCollection = createListCollection({
    items: monthOptions,
  })

  const productStats: ProductMovementStat[] = useMemo(() => {
    if (!products || !movements) return [];
    
    const stats: Record<number, ProductMovementStat> = {};
    

    products.forEach(product => {
      stats[product.id] = {
        product,
        totalIn: 0,
        totalOut: 0,
        difference: 0,
        totalInAmount: 0,
        totalOutAmount: 0,
        profitLoss: 0
      };
    });
    

    movements.forEach((movement) => {
      if (selectedMonth !== 'all') {
        const date = new Date(movement.date_created);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthYear !== selectedMonth) return;
      }
      
      const productId = typeof movement.product_id === 'object' ? movement.product_id.id : movement.product_id;
      
      if (stats[productId]) {
        const amount = movement.quantity * (movement.product_id.unit_price_eur || 0);
        
        if (movement.type === MovementType.IN) {
          stats[productId].totalIn += movement.quantity;
          stats[productId].totalInAmount += amount;
        } else if (movement.type === MovementType.OUT) {
          stats[productId].totalOut += movement.quantity;
          stats[productId].totalOutAmount += amount;
        }
      }
    });
    
    Object.values(stats).forEach(stat => {
      stat.difference = stat.totalIn - stat.totalOut;
      stat.profitLoss = stat.totalOutAmount - stat.totalInAmount;
    });
    
    return Object.values(stats);
  }, [products, movements, selectedMonth]);

  const totals = useMemo(() => {
    if (!allMovements) return {
      totalIn: 0,
      totalOut: 0,
      totalInAmount: 0,
      totalOutAmount: 0,
      profitLoss: 0
    };
  
    let totalIn = 0;
    let totalOut = 0;
    let totalInAmount = 0;
    let totalOutAmount = 0;
  
    allMovements.forEach((movement) => {
      if (selectedMonth !== 'all') {
        const date = new Date(movement.date_created);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthYear !== selectedMonth) return;
      }
  
      const unitPrice = typeof movement.product_id === 'object'
        ? movement.product_id.unit_price_eur
        : 0;
  
      const amount = movement.quantity * (unitPrice || 0);
  
      if (movement.type === MovementType.IN) {
        totalIn += movement.quantity;
        totalInAmount += amount;
      } else if (movement.type === MovementType.OUT) {
        totalOut += movement.quantity;
        totalOutAmount += amount;
      }
    });
  
    return {
      totalIn,
      totalOut,
      totalInAmount,
      totalOutAmount,
      profitLoss: totalOutAmount - totalInAmount
    };
  }, [allMovements, selectedMonth]);

  function getMonthDateRange(monthYear: string) {
    const [year, month] = monthYear.split('-').map(Number);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
  
    const endDate = new Date(year, month, 1);
    const end = endDate.toISOString().split('T')[0];
  
    return { _gte: start, _lt: end };
  }

  const columns: Column<ProductMovementStat>[] = [
    {
      header: t('products.list.columns.reference'),
      accessor: (stat: ProductMovementStat) => stat.product.reference,
    },
    {
      header: t('products.list.columns.part_number'),
      accessor: (stat: ProductMovementStat) => stat.product.part_number,
    },
    {
      header: t('products.list.columns.category'),
      accessor: (stat: ProductMovementStat) => stat.product.category_id?.name || t('products.list.uncategorized'),
    },
    {
      header: t('products.movement_stats.columns.quantity_in'),
      accessor: (stat: ProductMovementStat) => stat.totalIn,
    },
    {
      header: t('products.movement_stats.columns.quantity_out'),
      accessor: (stat: ProductMovementStat) => stat.totalOut,
    },
    {
      header: t('products.movement_stats.columns.difference'),
      accessor: (stat: ProductMovementStat) => stat.difference,
    },
    {
      header: t('products.movement_stats.columns.amount_in'),
      accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.totalInAmount),
    },
    {
      header: t('products.movement_stats.columns.amount_out'),
      accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.totalOutAmount),
    },
    {
      header: t('products.movement_stats.columns.profit_loss'),
      accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.profitLoss),
    },
  ];

  useEffect(() => {
    fetchPaginatedProducts({
      page,
      limit: pageSize
    });
    fetchAllMovements({
      fields: [
        'date_created',
        'product_id.unit_price_eur',
        'type',
        'quantity',
      ]
    });
  
  }, [page, pageSize]);

  useEffect(() => {
    const filter = selectedMonth !== 'all' ? {
      date_created: getMonthDateRange(selectedMonth)
    } : undefined;
    
    fetchPaginatedMovements({
      filter
    });
  
  }, [selectedMonth]);

  if ((productsLoading || movementsLoading || allMovementsLoading) && (!products || products.length <= 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={[4, 6]}>
        <Heading as="h1" size="lg">{t('products.movement_stats.title')}</Heading>
        <Flex gap={3}>
          <ExportButton
            baseUrl="/products/movement-stats"
          />
        </Flex>
      </Flex>

      <Box mb={6}>
        <HStack gap={4}>
          <LuCalendar />
          <SelectRoot
            value={[selectedMonth]}
            onValueChange={(e) => setSelectedMonth(e.value[0])}
            collection={monthOptionsCollection}
            width="300px"
          >
            <SelectTrigger>
              {monthOptions.find(option => option.value === selectedMonth)?.label || t('common.all')}
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} item={{ value: option.value, label: option.label }}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </HStack>
      </Box>


      <Grid templateColumns={["1fr", null, null, "0.4fr 0.4fr 1fr 1fr 1fr"]} gap={4} mb={6}>
        <StatCard
          title={t('products.movement_stats.cards.total_in')}
          value={totals.totalIn}
          icon={LuArrowUp}
          loading={productsLoading || movementsLoading}
          colorPalette="green"
        />
        
        <StatCard
          title={t('products.movement_stats.cards.total_out')}
          value={totals.totalOut}
          icon={LuArrowDown}
          loading={productsLoading || movementsLoading}
          colorPalette="red"
        />
        
        <StatCard
          title={t('products.movement_stats.cards.total_in_amount')}
          value={<ToggleableValue
            value={totals.totalInAmount}
            storageKey="showInAmount"
            label={t('products.movement_stats.cards.currency')}
          />}
          icon={LuDollarSign}
          loading={productsLoading || movementsLoading}
          colorPalette="green"
        />
        
        <StatCard
          title={t('products.movement_stats.cards.total_out_amount')}
          value={<ToggleableValue
            value={totals.totalOutAmount}
            storageKey="showOutAmount"
            label={t('products.movement_stats.cards.currency')}
          />}
          icon={LuDollarSign}
          loading={productsLoading || movementsLoading}
          colorPalette="red"
        />
        
        <StatCard
          title={t('products.movement_stats.cards.profit_loss')}
          value={<ToggleableValue
            value={totals.profitLoss}
            storageKey="showProfitLoss"
            label={t('products.movement_stats.cards.currency')}
          />}
          icon={LuTrendingUp}
          loading={productsLoading || movementsLoading}
          colorPalette={totals.profitLoss >= 0 ? "green" : "red"}
        />
      </Grid>


      {(productsError || movementsError) && (
        <ErrorDisplay
          error={(productsError || movementsError || allMovementsError)?.message || 'Une erreur est survenue'}
          onRetry={() => {
            fetchPaginatedProducts({
              page,
              limit: pageSize
            });
            fetchPaginatedMovements();
          }}
        />
      )}


      <DataTable<ProductMovementStat>
        columns={columns}
        data={productStats}
        total={paginatedProducts?.meta?.total_count || 0}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        keyExtractor={(stat) => stat.product.id}
        emptyMessage={t('products.movement_stats.no_data')}
      />
    </Box>
  );
};

export default ProductMovementStats;
