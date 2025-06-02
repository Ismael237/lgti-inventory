import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Stack,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { usePartners } from '@hooks/use-partners';
import { usePartnerTypes } from '@hooks/use-partner-types';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';

const PartnerDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchPartnerByIdRequest
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
      const partnerId = Number(id);
      fetchPartnerById(partnerId);
    }
    fetchPartnerTypesRequest.execute();
  }, [id]);

  if (isLoading && !partner) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchPartnerById(Number(id))} />;
  }

  if (!partner) {
    return <Box>{t('partners.details.not_found')}</Box>;
  }

  return (
    <Stack gap={4}>
      <Box>
        <Stack gap={4}>
          <Heading as="h2" size="lg">{partner.name}</Heading>

          <SimpleGrid columns={[1, 3]} gap={6}>
            <Box>
              <Heading as="h3" size="md" mb={3}>{t('partners.details.general_info')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('partners.details.name')}
                  value={partner.name}
                />

                <DataListItem
                  label={t('partners.details.email')}
                  value={partner.contact_email || t('partners.details.not_specified')}
                />

                <DataListItem
                  label={t('partners.details.id')}
                  value={partner.id}
                />
              </DataListRoot>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('partners.details.address_info')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('partners.details.address')}
                  value={partner.contact_email || t('partners.details.not_specified')}
                />

                <DataListItem
                  label={t('partners.details.type')}
                  value={partner.partner_type && partner.partner_type.length > 0 ? (
                    <Stack direction="row" gap={2}>
                      {partner.partner_type.map((type) => (
                        <Badge key={type.partner_type_id.id}>{type.partner_type_id.type_name}</Badge>
                      ))}
                    </Stack>
                  ) : (
                    <Badge colorPalette="gray">{t('partners.details.untyped')}</Badge>
                  )}
                />
              </DataListRoot>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={3}>{t('partners.details.metadata')}</Heading>
              <DataListRoot>
                <DataListItem
                  label={t('partners.details.created_at')}
                  value={formatDateWithFallback(partner.date_created)}
                />

                <DataListItem
                  label={t('partners.details.created_by')}
                  value={formatUserFullName(partner.user_created)}
                />

                <DataListItem
                  label={t('partners.details.last_updated')}
                  value={partner.date_updated ? formatDateWithFallback(partner.date_updated) : t('partners.details.never')}
                />

                <DataListItem
                  label={t('partners.details.updated_by')}
                  value={partner.user_updated ? formatUserFullName(partner.user_updated) : t('partners.details.na')}
                />
              </DataListRoot>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
};

export default PartnerDetails;
