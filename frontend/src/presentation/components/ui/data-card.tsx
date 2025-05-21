import { Box, Heading, Text, Flex, BoxProps } from '@chakra-ui/react';
import { useColorModeValue } from '@ui/chakra/color-mode';

interface DataCardProps extends BoxProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

export const DataCard = ({ title, value, icon, footer, ...rest }: DataCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
      {...rest}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Heading as="h3" size="sm" color="gray.500">
          {title}
        </Heading>
        {icon && <Box color="gray.400">{icon}</Box>}
      </Flex>
      
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        {value}
      </Text>
      
      {footer && (
        <Box mt={4} fontSize="sm" color="gray.500">
          {footer}
        </Box>
      )}
    </Box>
  );
};
