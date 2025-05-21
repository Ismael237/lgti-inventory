import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs'
}

export const LoadingSpinner = ({ text, size="sm" }: LoadingSpinnerProps) => {
  const { t } = useTranslation();
  const color = useColorModeValue('brand.500', 'brand.300');
  const defaultText = t('common.loading');
  
  return (
    <Flex alignItems="center" justifyContent="center" gap={4} h="sm" >
      <Spinner
        size={size}
        color={color}
      />
      <Text color="gray.500">
        {text || defaultText}
      </Text>
    </Flex>
  );
};
