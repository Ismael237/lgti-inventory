import { Box, Flex, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Sidebar, SidebarMobile } from './sidebar';
import { Footer } from './footer';
import { useAuth } from '@hooks/use-auth';
import { getSidebarWidth } from '@utils/string';


export const Layout = () => {
  const { open, onClose, onToggle } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isAuthenticated } = useAuth();
  const sidebarWidth = getSidebarWidth(isAuthenticated);

  const toggleSidebar = () => {
    onToggle();
  };

  return (
    <Box minH="100vh" bg="bg.subtle" maxW="100vw">
      {isMobile ? <SidebarMobile isOpen={open} onClose={onClose} /> : <Sidebar />}

      <Flex
        ml={{ base: 0, md: sidebarWidth }}
        flexDirection="column"
        pos="relative" minH="100svh"
        w={isMobile ? '100%' : `calc(100vw - ${sidebarWidth})`}
      >

        <Header onToggleSidebar={toggleSidebar} />

        <Box
          flex="1"
          px={[2, 4, 8]}
          mt={[6]}
          mb={[4, 8]}
        >
          <Outlet />
        </Box>

        <Footer />
      </Flex>
    </Box>
  );
};
