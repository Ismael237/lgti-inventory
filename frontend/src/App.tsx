import { Provider as ChakraProvider } from '@ui/chakra/provider';
import { AppRouter } from '@routes/routes';
import { Toaster } from '@ui/chakra/toaster';
import ErrorBoundary from '@pages/error-boundary';
import '@fontsource/inter/index.css';

export function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider defaultTheme='light'>
        <AppRouter />
        <Toaster />
      </ChakraProvider>
    </ErrorBoundary>
  );
}
