import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Stack,
    Text,
    VStack,
    Code,
} from '@chakra-ui/react';
import { LuTriangleAlert, LuRotateCcw, LuChevronLeft, LuHouse } from 'react-icons/lu';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { toaster } from '@ui/chakra/toaster';
import { useTranslation } from 'react-i18next';

/**
 * A custom error element for react-router-dom that displays styled error messages
 */
export const ErrorElement: React.FC = () => {
    const error = useRouteError();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Extract error details
    const errorMessage = isRouteErrorResponse(error)
        ? error.statusText || error.data?.message || t('errors.unknown')
        : error instanceof Error
            ? error.message
            : t('errors.unknown_occurred');

    const errorStatus = isRouteErrorResponse(error) ? error.status : 500;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Determine header message based on error
    let headerMessage = t('errors.something_went_wrong');
    if (isRouteErrorResponse(error)) {
        switch (errorStatus) {
            case 404:
                headerMessage = t('errors.page_not_found');
                break;
            case 403:
                headerMessage = t('errors.access_forbidden');
                break;
            case 401:
                headerMessage = t('errors.unauthorized_access');
                break;
            case 500:
                headerMessage = t('errors.server_error');
                break;
        }
    }

    // Colors
    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

    // Handle retry
    const handleRetry = () => {
        toaster.info({
            title: t('actions.retrying'),
            duration: 2000,
            closable: true,
        });
        navigate(0); // Refresh current route
    };

    // Handle go back
    const handleGoBack = () => {
        navigate(-1);
    };

    // Handle go home
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container maxW="container.lg" py={16}>
            <Flex
                direction="column"
                align="center"
                justify="center"
                minH="60vh"
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                rounded="xl"
                shadow="lg"
                p={8}
                position="relative"
                overflow="hidden"
            >
                {/* Visual elements */}
                <Box
                    position="absolute"
                    top="-10%"
                    right="-5%"
                    bg="red.50"
                    opacity={0.6}
                    rounded="full"
                    w="300px"
                    h="300px"
                    zIndex={0}
                    display={{ base: 'none', md: 'block' }}
                />
                <Box
                    position="absolute"
                    bottom="-15%"
                    left="-10%"
                    bg="brand.50"
                    opacity={0.4}
                    rounded="full"
                    w="400px"
                    h="400px"
                    zIndex={0}
                    display={{ base: 'none', md: 'block' }}
                />

                <VStack gap={6} zIndex={1} textAlign="center" w="full">
                    <Icon as={LuTriangleAlert} w={16} h={16} color="red.500" />

                    <Stack gap={2}>
                        <Heading as="h1" size="xl" color={textColor}>
                            {headerMessage}
                        </Heading>
                        <Text fontSize="2xl" fontWeight="bold" color="red.500">
                            {isRouteErrorResponse(error) && errorStatus ? `Error ${errorStatus}` : 'Error'}
                        </Text>
                    </Stack>

                    <Text fontSize="lg" color={secondaryTextColor}>
                        {errorMessage}
                    </Text>

                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        pt={8}
                    >
                        <Button
                            onClick={handleGoBack}
                            colorPalette="gray"
                            variant="outline"
                        ><LuChevronLeft />
                            {t('actions.go_back')}
                        </Button>
                        <Button
                            onClick={handleRetry}
                            colorPalette="brand"
                        ><LuRotateCcw />
                            {t('actions.try_again')}
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            colorPalette="purple"
                        >
                            <LuHouse />
                            {t('actions.go_home')}
                        </Button>
                    </Stack>

                    {errorStack && (
                        <Box
                            mt={8}
                            w="full"
                            p={4}
                            bg="gray.50"
                            borderRadius="md"
                            maxH="400px"
                            overflowY="auto"
                            textAlign="left"
                            divideX="2px"
                        >
                            <Text color="black" fontWeight="bold" mb={2}>{t('errors.details')} :</Text>
                            <Code w="full" p={2} display="block" whiteSpace="pre-wrap" fontSize="sm">
                                {errorStack}
                            </Code>
                        </Box>
                    )}
                </VStack>
            </Flex>
        </Container>
    );
};

/**
 * A class component ErrorBoundary for catching errors in the component tree
 */
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // You can log the error to an error reporting service here
        console.error("Uncaught error:", error, errorInfo);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback || <ErrorElement />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;