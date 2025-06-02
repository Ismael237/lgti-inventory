import React from 'react';
import { Box, VStack, Flex, Text, Icon, Heading, Spinner } from '@chakra-ui/react';
import { LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ComponentType;
  trend?: number;
  loading?: boolean;
  colorPalette?: string;
  onClick?: () => void;
  borderRadius?: string;
  padding?: string;
  minHeight?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend = 0,
  loading = false,
  colorPalette = 'brand',
  onClick,
  borderRadius = 'lg',
  padding = '4',
  minHeight
}) => {
  const { t } = useTranslation();
  const trendIcon = trend > 0 ? LuTrendingUp : LuTrendingDown;
  const trendColor = trend > 0 ? 'green.500' : 'red.500';

  return (
    <Box
      p={padding}
      borderWidth="1px"
      borderColor="border"
      borderRadius={borderRadius}
      bg="white"
      _dark={{ bg: 'gray.800' }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      minHeight={minHeight}
      transition="all 0.2s"
      _hover={onClick ? { 
        boxShadow: 'md',
        borderColor: `${colorPalette}.200`
      } : undefined}
    >
      <VStack gap="2" align="stretch">
        <Flex gap="2" justify="space-between" align="center">
          <Text fontSize="xs" color="fg.muted">{title}</Text>
          <Icon as={icon} boxSize="4" color={`${colorPalette}.500`} />
        </Flex>

        {loading ? (
          <Spinner size="md" />
        ) : (
          <VStack gap="0" align="stretch">
            {typeof value === 'string' || typeof value === 'number' ? (
              <Heading size="lg">{value}</Heading>
            ) : (value)}
            {trend !== 0 && (
              <Flex align="center" gap="1">
                <Icon as={trendIcon} color={trendColor} />
                <Text fontSize="sm" color={trendColor}>
                  {Math.abs(trend)}% {trend > 0 ? t('common.increase') : t('common.decrease')}
                </Text>
              </Flex>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default StatCard;
