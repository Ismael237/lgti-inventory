import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';

import { useMovements } from '@hooks/use-movements';
import { useProducts } from '@hooks/use-products';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import {
  formatDateWithFallback,
  formatUserFullName,
  formatEURwithXAF,
} from '@utils/format';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';
import { MovementType } from '@entities';

const MovementDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchMovementByIdRequest,
    fetchMovementsByProductRequest
  } = useMovements();
  
  const { fetchProductByIdRequest } = useProducts();
  
  const {
    execute: fetchMovementById,
    data: movement,
    error,
    isLoading
  } = fetchMovementByIdRequest;
  
  const {
    execute: fetchRelatedMovements,
    data: relatedMovements
  } = fetchMovementsByProductRequest;
  
  const {
    execute: fetchProductDetails,
    data: productDetails
  } = fetchProductByIdRequest;

  useEffect(() => {
    if (id) {
      fetchMovementById(Number(id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  useEffect(() => {
    if (movement && movement.product_id) {
      fetchRelatedMovements({ productId: movement.product_id.id});
      fetchProductDetails(movement.product_id.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movement]);

  const getTypeColor = (type: MovementType): string => {
    const typeColors = {
      [MovementType.IN]: 'green',
      [MovementType.OUT]: 'red'
    };
    return typeColors[type] || 'gray';
  };
  
  // Calculer le montant total du mouvement
  const totalAmount = movement ? movement.quantity * movement.product_id.unit_price_eur : 0;
  
  // Trouver les mouvements récents pour le même produit
  const recentMovements = relatedMovements
    ? relatedMovements.data
        .filter(m => m.id !== movement?.id)
        .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
        .slice(0, 5)
    : [];

  if (isLoading && !movement) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchMovementById(Number(id))} />;
  }

  if (!movement) {
    return <Box>{t('movements.details.not_found')}</Box>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Stack gap={4}>
        <Heading as="h2" size="lg">
          {t('movements.details.title')}: {movement.product_id.reference}
          <Badge ml={2} colorPalette={getTypeColor(movement.type)}>
            {movement.type === MovementType.IN ? t('movements.types.in') : t('movements.types.out')}
          </Badge>
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Informations principales */}
          <Box>
            <Heading as="h3" size="md" mb={3}>{t('movements.details.general_info')}</Heading>
            <DataListRoot>
              <DataListItem 
                label={t('common.id')} 
                value={movement.id} 
              />
              
              <DataListItem 
                label={t('movements.details.type')} 
                value={
                  <Badge colorPalette={getTypeColor(movement.type)}>
                    {movement.type === MovementType.IN ? t('movements.types.in') : t('movements.types.out')}
                  </Badge>
                } 
                info={t('movements.details.type_info')}
              />
              
              <DataListItem 
                label={t('movements.details.product')} 
                value={movement.product_id.reference} 
                info={t('movements.details.product_info')}
              />
              
              <DataListItem 
                label={t('movements.details.quantity')} 
                value={movement.quantity} 
              />
              
              <DataListItem 
                label={t('movements.details.total_amount')} 
                value={formatEURwithXAF(totalAmount)} 
                info={t('movements.details.total_amount_info')}
              />
            </DataListRoot>
          </Box>
          
          {/* Informations complémentaires */}
          <Box>
            <Heading as="h3" size="md" mb={3}>{t('movements.details.details')}</Heading>
            <DataListRoot>
              <DataListItem 
                label={t('movements.details.notes')} 
                value={movement.notes || t('movements.details.no_notes')} 
                grow
              />
              
              <DataListItem 
                label={t('common.created_at')} 
                value={formatDateWithFallback(movement.date_created)} 
              />
              
              <DataListItem 
                label={t('common.created_by')} 
                value={formatUserFullName(movement.user_created)} 
              />
              
              <DataListItem 
                label={t('common.last_updated')} 
                value={formatDateWithFallback(movement.date_updated)} 
              />
              
              <DataListItem 
                label={t('common.updated_by')} 
                value={formatUserFullName(movement.user_updated)} 
              />
            </DataListRoot>
          </Box>
        </SimpleGrid>
        
        {/* Informations sur le produit */}
        {productDetails && (
          <Box mt={4}>
            <Heading as="h3" size="md" mb={3}>{t('movements.details.product_info_title')}</Heading>
            <DataListRoot>
              <DataListItem 
                label={t('products.details.reference')} 
                value={productDetails.reference} 
              />
              
              <DataListItem 
                label={t('products.form.description')} 
                value={productDetails.description || t('products.details.no_description')} 
                grow
              />
              
              <DataListItem 
                label={t('products.form.category')} 
                value={productDetails.category_id ? productDetails.category_id.name : t('products.list.uncategorized')} 
              />
              
              <DataListItem 
                label={t('movements.details.current_unit_price')} 
                value={formatEURwithXAF(productDetails.unit_price_eur)} 
              />
            </DataListRoot>
          </Box>
        )}
        
        {/* Mouvements récents pour ce produit */}
        {recentMovements.length > 0 && (
          <Box mt={4}>
            <Heading as="h3" size="md" mb={3}>{t('movements.details.recent_movements')}</Heading>
            <DataListRoot>
              {recentMovements.map((relatedMovement) => (
                <DataListItem
                  key={relatedMovement.id}
                  label={
                    <Stack direction="row" align="center" gap={2}>
                      <Badge colorPalette={getTypeColor(relatedMovement.type)}>
                        {relatedMovement.type === MovementType.IN ? t('movements.types.in') : t('movements.types.out')}
                      </Badge>
                      <Text>{formatDateWithFallback(relatedMovement.date_created)}</Text>
                    </Stack>
                  }
                  value={
                    <Stack direction="row" gap={4}>
                      <Text>{t('movements.details.qty_short')}: {relatedMovement.quantity}</Text>
                      <Text>{t('movements.details.price_short')}: {formatEURwithXAF(relatedMovement.product_id.unit_price_eur)}</Text>
                    </Stack>
                  }
                />
              ))}
            </DataListRoot>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default MovementDetails;
