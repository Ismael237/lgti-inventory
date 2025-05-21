import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Text, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useMovements } from '@hooks/use-movements';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';

export const MovementDeleteContent = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchMovementByIdRequest,
  } = useMovements();
  
  const {
    execute: fetchMovementById,
    data: movement,
    error,
    isLoading
  } = fetchMovementByIdRequest;

  useEffect(() => {
    if (id) {
      fetchMovementById(Number(id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchMovementById(Number(id))} />;
  }

  if (!movement) {
    return <Box>{t('movements.delete.not_found')}</Box>;
  }

  return (
    <Box>
      <Text mb={4}>
        {t('movements.delete.confirm', { reference: movement.product_id.reference })}
      </Text>
      <Text mb={4} color="red.500">
        {t('common.delete_warning')}
      </Text>
    </Box>
  );
};

export const MovementDeleteFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    deleteMovementRequest,
  } = useMovements();
  
  const {
    execute: deleteMovement,
    isLoading
  } = deleteMovementRequest;

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteMovement(Number(id));
      navigate('/movements');
    } catch (error) {
      console.error('Error deleting movement:', error);
    }
  };

  return (
    <Flex gap={3} justify="flex-end">
      <Button
        variant="outline"
        onClick={() => navigate('/movements')}
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
