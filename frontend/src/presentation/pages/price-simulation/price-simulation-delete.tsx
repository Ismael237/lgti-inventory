import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Text, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { usePriceSimulations } from '@hooks/use-price-simulations';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';

export const PriceSimulationDeleteContent = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchPriceSimulationByIdRequest,
  } = usePriceSimulations();
  
  const {
    execute: fetchPriceSimulationById,
    data: simulation,
    error,
    isLoading
  } = fetchPriceSimulationByIdRequest;

  useEffect(() => {
    if (id) {
      fetchPriceSimulationById(Number(id));
    }
  
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchPriceSimulationById(Number(id))} />;
  }

  if (!simulation) {
    return <Box>{t('price_simulations.delete.not_found')}</Box>;
  }

  return (
    <Box>
      <Text mb={4}>
        {t('price_simulations.delete.confirm', { name: simulation.scenario_name })}
      </Text>
      <Text mb={4} color="red.500">
        {t('common.delete_warning')}
      </Text>
    </Box>
  );
};

export const PriceSimulationDeleteFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    deletePriceSimulationRequest,
  } = usePriceSimulations();
  
  const {
    execute: deletePriceSimulation,
    isLoading
  } = deletePriceSimulationRequest;

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deletePriceSimulation(Number(id));
      navigate('/price-simulations');
    } catch (error) {
      console.error('Error deleting price simulation:', error);
    }
  };

  return (
    <Flex gap={3} justify="flex-end">
      <Button
        variant="outline"
        onClick={() => navigate('/price-simulations')}
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
