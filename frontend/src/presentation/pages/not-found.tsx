import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { Link } from 'react-router-dom';
import { LuHouse } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/chakra/button';

const NotFound = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { t } = useTranslation();
  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="70vh"
    >
      <VStack
        gap={4}
        p={8}
        borderRadius="lg"
        bg={bgColor}
        boxShadow="sm"
        textAlign="center"
        maxW="md"
        w="full"
      >
        <Heading as="h1" size="xl">404</Heading>
        <Heading as="h2" size="md">{t('pages.not_found.title')}</Heading>
        <Text color="gray.500">
          {t('pages.not_found.message')}
        </Text>
        <Button
          as={Link}
        >
          <LuHouse size={16} />
          <Link to="/">
            {t('pages.not_found.back_to_home')}
          </Link>
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;