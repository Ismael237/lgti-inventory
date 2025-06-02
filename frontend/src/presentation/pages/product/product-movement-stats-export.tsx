/* eslint-disable react-hooks/exhaustive-deps */
import type { Product } from "@entities/product.types";
import type { Movement } from "@entities/movement.types";
import { useMovements } from "@hooks/use-movements";
import { useProducts } from "@hooks/use-products";
import { LoadingSpinner } from "@ui/loading-spinner";
import { exportToCsv, type ColumnExportConfig } from "@utils/csv-export";
import { formatDateForFilename, formatEURwithXAF } from "@utils/format";
import { useEffect, useState, type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MovementType } from "@entities";

interface ProductMovementStat {
  product: Product;
  totalIn: number;
  totalOut: number;
  difference: number;
  totalInAmount: number;
  totalOutAmount: number;
  profitLoss: number;
}

interface ProductMovementStatsExportProps {
  redirectPath?: string;
  showSuccessMessage?: boolean;
}

export const ProductMovementStatsExport: FC<ProductMovementStatsExportProps> = ({
  redirectPath = '/products/movement-stats',
  showSuccessMessage = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    fetchPaginatedProductsRequest,
  } = useProducts();
  
  const {
    fetchMovementsRequest,
    selectedMonth,
  } = useMovements();
  
  const { data: products, execute: fetchPaginatedProducts } = fetchPaginatedProductsRequest;
  const { data: movements, execute: fetchAllMovements } = fetchMovementsRequest;
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const getMonthDateRange = (monthYear: string) => {
    const [year, month] = monthYear.split('-').map(Number);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
  
    const endDate = new Date(year, month, 1);
    const end = endDate.toISOString().split('T')[0];
  
    return { _gte: start, _lt: end };
  }

  const productStats: ProductMovementStat[] = useMemo(() => {
    if (!products?.data || !movements) return [];
    
    const stats: Record<number, ProductMovementStat> = {};
    
    products.data.forEach(product => {
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
        const quantity = movement.quantity || 0;
        const unitPrice = 'unit_price' in movement ? (movement as Movement & { unit_price: number }).unit_price : 0;
        const totalAmount = quantity * unitPrice;
        
        if (movement.type === MovementType.IN) {
          stats[productId].totalIn += quantity;
          stats[productId].totalInAmount += totalAmount;
        } else if (movement.type === MovementType.OUT) {
          stats[productId].totalOut += quantity;
          stats[productId].totalOutAmount += totalAmount;
        }
      }
    });
    
    Object.values(stats).forEach(stat => {
      stat.difference = stat.totalIn - stat.totalOut;
      stat.profitLoss = stat.totalOutAmount - stat.totalInAmount;
    });
    
    return Object.values(stats);
  }, [products, movements, selectedMonth]);

  const columns: ColumnExportConfig<ProductMovementStat>[] = [
    { header: t('products.movement_stats.export.columns.product_id'), accessor: (stat: ProductMovementStat) => stat.product.id },
    { header: t('products.movement_stats.export.columns.product_name'), accessor: (stat: ProductMovementStat) => stat.product.reference || '' },
    { header: t('products.movement_stats.export.columns.total_in'), accessor: (stat: ProductMovementStat) => stat.totalIn },
    { header: t('products.movement_stats.export.columns.total_out'), accessor: (stat: ProductMovementStat) => stat.totalOut },
    { header: t('products.movement_stats.export.columns.difference'), accessor: (stat: ProductMovementStat) => stat.difference },
    { header: t('products.movement_stats.export.columns.total_in_amount'), accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.totalInAmount) },
    { header: t('products.movement_stats.export.columns.total_out_amount'), accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.totalOutAmount) },
    { header: t('products.movement_stats.export.columns.profit_loss'), accessor: (stat: ProductMovementStat) => formatEURwithXAF(stat.profitLoss) }
  ];

  useEffect(() => {
    fetchPaginatedProducts();
    
    const filter = selectedMonth !== 'all' ? {
      date_created: getMonthDateRange(selectedMonth)
    } : undefined;
    
    fetchAllMovements({
      filter
    });
  }, []);

  useEffect(() => {
    if (products?.data.length && movements?.length && !exportTriggered) {
      setExportTriggered(true);
      exportData();
    }
  }, [products, movements]);

  const exportData = async () => {
    if (!productStats.length || isExporting) return;

    try {
      setIsExporting(true);
      const formattedDate = formatDateForFilename();
      
      const monthLabel = () => {
        if (selectedMonth === 'all') return t('common.all');
        const [year, month] = selectedMonth.split('-');
        return `${t(`common.months.${parseInt(month) - 1}`)} ${year}`;
      };

      const filename = `product-movement-stats(${monthLabel()})-${formattedDate}.csv`;

      exportToCsv<ProductMovementStat>(columns, productStats, filename);
      await new Promise(res => setTimeout(res, 500));

      if (redirectPath) {
        navigate(redirectPath, {
          state: {
            exportSuccess: showSuccessMessage ? true : undefined,
            message: showSuccessMessage ? t('products.movement_stats.export.success') : undefined,
          }
        });
      }
    } catch (error) {
      console.error('Error exporting product movement stats:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <LoadingSpinner text={t('products.movement_stats.export.loading')} />
  );
};

export default ProductMovementStatsExport;
