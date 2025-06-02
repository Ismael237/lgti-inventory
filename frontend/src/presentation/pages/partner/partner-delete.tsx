import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Text, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { usePartners } from '@hooks/use-partners';
import { usePartnerTypes } from '@hooks/use-partner-types';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorDisplay } from '@ui/error-display';
import { Button } from '@ui/chakra/button';

export const PartnerDeleteContent = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchPartnerByIdRequest,
  } = usePartners();
  
  const {
    fetchPartnerTypesRequest
  } = usePartnerTypes();
  
  const {
    execute: fetchPartnerById,
    data: partner,
    error,
    isLoading
  } = fetchPartnerByIdRequest;

  useEffect(() => {
    if (id) {
      fetchPartnerById(Number(id));
    }
    fetchPartnerTypesRequest.execute();
  
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchPartnerById(Number(id))} />;
  }

  if (!partner) {
    return <Box>{t('partners.delete.not_found')}</Box>;
  }

  return (
    <Box>
      <Text mb={4}>
        {t('partners.delete.confirm', { name: partner.name, email: partner.contact_email || t('partners.delete.no_email') })}
      </Text>
      <Text mb={4} color="red.500">
        {t('partners.delete.warning')}
      </Text>
    </Box>
  );
};

export const PartnerDeleteFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    deletePartnerRequest,
  } = usePartners();
  
  const {
    execute: deletePartner,
    isLoading
  } = deletePartnerRequest;

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deletePartner(Number(id));
      navigate('/partners');
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  return (
    <Flex gap={3} justify="flex-end">
      <Button
        variant="outline"
        onClick={() => navigate('/partners')}
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
