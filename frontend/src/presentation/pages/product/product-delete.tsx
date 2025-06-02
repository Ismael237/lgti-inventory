import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Text, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useProducts } from '@hooks/use-products';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { Button } from '@ui/chakra/button';

export const ProductDeleteContent = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchProductByIdRequest,
  } = useProducts();
  
  const {
    execute: fetchProductById,
    data: product,
    error,
    isLoading
  } = fetchProductByIdRequest;

  useEffect(() => {
    if (id) {
      fetchProductById(Number(id));
    }
  
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchProductById(Number(id))} />;
  }

  if (!product) {
    return <Box>{t('products.delete.not_found')}</Box>;
  }

  return (
    <Box>
      <Text mb={4}>
        {t('products.delete.confirm', { reference: product.reference, part_number: product.part_number || t('products.delete.no_part_number') })}
      </Text>
      <Text mb={4} color="red.500">
        {t('products.delete.warning')}
      </Text>
    </Box>
  );
};

export const ProductDeleteFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    deleteProductRequest,
  } = useProducts();
  
  const {
    execute: deleteProduct,
    isLoading
  } = deleteProductRequest;

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteProduct(Number(id));
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <Flex gap={3} justify="flex-end">
      <Button
        variant="outline"
        onClick={() => navigate('/products')}
      >
        {t('actions.cancel')}
      </Button>
      <Button
        colorPalette="red"
        loading={isLoading}
        onClick={handleDelete}
      >
        {t('actions.delete')}
      </Button>
    </Flex>
  );
};
