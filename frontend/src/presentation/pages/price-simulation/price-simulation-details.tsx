import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  Stack,
  Badge,
} from '@chakra-ui/react';

import { usePriceSimulations } from '@hooks/use-price-simulations';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import { formatDate, formatUserFullName } from '@utils/format';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';

const PriceSimulationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchPriceSimulationByIdRequest
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

  if (isLoading && !simulation) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchPriceSimulationById(Number(id))} />;
  }

  if (!simulation) {
    return <Box>{t('price_simulations.details.not_found')}</Box>;
  }

  // Calculer l'impact du facteur sur les prix
  const calculateFactorImpact = () => {
    if (!simulation) return { percentage: 0 };
    
    // Le facteur représente directement le pourcentage d'augmentation/diminution
    // Par exemple, un facteur de 1.05 représente une augmentation de 5%
    const percentage = (simulation.factor - 1) * 100;
    
    return {
      percentage
    };
  };

  const factorImpact = calculateFactorImpact();

  // Déterminer la couleur du badge en fonction du changement de prix
  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'gray';
  };

  return (
    <Stack gap={4}>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box p={4}>
          <Heading as="h2" size="lg">{simulation.scenario_name}</Heading>
        </Box>
        
        <Box p={4}>
          <Stack direction="column" gap={6}>
            {/* Informations principales */}
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('price_simulations.details.general_info')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('common.id')}
                  value={simulation.id}
                />
                
                <DataListItem
                  label={t('price_simulations.form.factor')}
                  value={`${simulation.factor}x`}
                  info={t('price_simulations.details.factor_info')}
                />
                
                <DataListItem
                  label={t('price_simulations.details.percentage_change')}
                  value={
                    <Badge colorPalette={getPriceChangeColor(factorImpact.percentage)}>
                      {factorImpact.percentage > 0 ? '+' : ''}{factorImpact.percentage}%
                    </Badge>
                  }
                />
              </DataListRoot>
            </Box>
            
            {/* Métadonnées */}
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('price_simulations.details.metadata')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('common.created_at')}
                  value={formatDate(simulation.date_created)}
                />
                
                <DataListItem
                  label={t('common.created_by')}
                  value={formatUserFullName(simulation.user_created)}
                />
                
                <DataListItem
                  label={t('common.last_updated')}
                  value={simulation.date_updated ? formatDate(simulation.date_updated) : t('common.never')}
                />
                
                <DataListItem
                  label={t('common.updated_by')}
                  value={simulation.user_updated ? formatUserFullName(simulation.user_updated) : t('common.not_applicable')}
                />
              </DataListRoot>
            </Box>
            
            {/* Impact de la simulation */}
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('price_simulations.details.impact')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('price_simulations.details.margin_impact')}
                  value={
                    <Badge colorPalette={factorImpact.percentage >= 0 ? 'green' : 'red'}>
                      {factorImpact.percentage >= 0 ? t('price_simulations.details.positive') : t('price_simulations.details.negative')}
                    </Badge>
                  }
                  info={t('price_simulations.details.margin_impact_info')}
                />
                
                <DataListItem
                  label={t('price_simulations.details.recommendation')}
                  value={
                    factorImpact.percentage > 5 ?
                      <Badge colorPalette="green">{t('price_simulations.details.highly_recommended')}</Badge> :
                    factorImpact.percentage > 0 ?
                      <Badge colorPalette="brand">{t('price_simulations.details.recommended')}</Badge> :
                    factorImpact.percentage === 0 ?
                      <Badge colorPalette="gray">{t('price_simulations.details.neutral')}</Badge> :
                    factorImpact.percentage > -5 ?
                      <Badge colorPalette="yellow">{t('price_simulations.details.consider')}</Badge> :
                      <Badge colorPalette="red">{t('price_simulations.details.not_recommended')}</Badge>
                  }
                />
              </DataListRoot>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};

export default PriceSimulationDetails;
