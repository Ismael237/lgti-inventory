import { Alert, Box, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  const { t } = useTranslation();
  return (
    <Box my={4}>
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Alert.Content gap={4}>
          <Flex flex="1" gap={2} flexDirection="column">
            <Alert.Title fontSize="lg">{t('common.error')}</Alert.Title>
            <Alert.Description display="block">
              {error}
            </Alert.Description>
          </Flex>
          {onRetry && (
            <Button colorPalette="red" variant="solid" onClick={onRetry} size="sm" maxWidth="max-content">
              {t('actions.retry')}
            </Button>
          )}
        </Alert.Content>
      </Alert.Root>
    </Box>
  );
};
