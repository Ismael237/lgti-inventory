import { Alert, Box, Button } from '@chakra-ui/react';
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
        <Alert.Content>
          <Box flex="1">
            <Alert.Title fontSize="lg">{t('common.error')}</Alert.Title>
            <Alert.Description display="block">
              {error}
            </Alert.Description>
          </Box>
          {onRetry && (
            <Button colorPalette="red" variant="outline" onClick={onRetry} size="sm">
              {t('actions.retry')}
            </Button>
          )}
        </Alert.Content>
      </Alert.Root>
    </Box>
  );
};
