import { Box, Text, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { useBreakpointValue } from '@chakra-ui/react';
import { useAuth } from '@hooks/use-auth';
import { getSidebarWidth } from '@utils/string';

export const Footer = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isAuthenticated } = useAuth();
  const sidebarWidth = getSidebarWidth(isAuthenticated);


  return (
    <Box
      as="footer"
      w={isMobile ? '100%' : `calc(100vw - ${sidebarWidth})`}
      py={3}
      bg={bgColor}
      borderTopWidth="1px"
      borderTopColor={borderColor}
    >
      <Flex justify="center" align="center">
        <Text fontSize="sm" color="gray.500">
          Inventory Management Platform &copy; {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
};
