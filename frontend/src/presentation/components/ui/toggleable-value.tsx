import React, { useState } from 'react';
import { VStack, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { formatSocialCurrency, formatEURwithXAF } from '@utils/format';
import { Tooltip } from './chakra/tooltip';

interface ToggleableValueProps {
  value: number;
  formatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  storageKey?: string;
  defaultVisible?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  hiddenPlaceholder?: string;
}

const ToggleableValue: React.FC<ToggleableValueProps> = ({
  value,
  formatter = formatSocialCurrency,
  tooltipFormatter = formatEURwithXAF,
  storageKey = 'showValue',
  defaultVisible = true,
  size = 'lg',
  label,
  hiddenPlaceholder = '*********'
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue === null ? defaultVisible : storedValue === 'true';
  });

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem(storageKey, String(newValue));
  };

  return (
    <VStack cursor="pointer" gap="0" align="stretch">
      {label && <Text fontSize="xs" color="fg.muted">{label}</Text>}
      <Flex gap={4} alignItems="center">
        <Tooltip content={isVisible ? tooltipFormatter(value) : hiddenPlaceholder} showArrow>
          <Heading size={size}>
            {isVisible ? formatter(value) : hiddenPlaceholder}
          </Heading>
        </Tooltip>
        <Icon
          aria-label={isVisible ? t('common.hide_value') : t('common.show_value')}
          size="sm"
          onClick={toggleVisibility}
          _hover={{ color: 'brand.500' }}
          _active={{ color: 'brand.700' }}
        >{isVisible ? <LuEyeOff /> : <LuEye />}</Icon>
      </Flex>
    </VStack>
  );
};

export default ToggleableValue;
