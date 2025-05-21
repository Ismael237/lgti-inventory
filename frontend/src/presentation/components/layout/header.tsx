import {
  Box,
  Flex,
  Heading,
  useBreakpointValue,
  Avatar,
  Icon
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { useAuth } from '@hooks/use-auth';
import { getSidebarWidth } from '@utils/string';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogTitle
} from '@ui/chakra/dialog';
import { formatUserFullName } from '@utils/format';
import { UserProfile } from '@components/user/user-profile';
import { pickPalette } from '@utils/theme';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { t } = useTranslation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { isAuthenticated, user } = useAuth();
  const sidebarWidth = getSidebarWidth(isAuthenticated);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useRef(60);

  const dialogContentRef = useRef<HTMLDivElement>(null);

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  useEffect(() => {
    if (headerRef.current) {
      headerHeight.current = headerRef.current.offsetHeight;
    }

    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        const scrollThreshold = 10;

        const scrollingDown = window.scrollY > lastScrollY;
        const scrollingUp = window.scrollY < lastScrollY;

        if (scrollingDown && window.scrollY > scrollThreshold) {
          setIsVisible(false);
        } else if (scrollingUp || window.scrollY <= scrollThreshold) {
          setIsVisible(true);
        }

        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlHeader);

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  return (
    <>
      {isVisible && (<Box
        ref={headerRef}
        as="header"
        position="fixed"
        top={0}
        w={isMobile ? '100%' : `calc(100vw - ${sidebarWidth})`}
        bg={bgColor}
        borderBottomWidth="1px"
        borderBottomColor="border"
        zIndex={10}
        _open={{
          animation: "slide-from-top 300ms",
        }}
        _closed={{
          animation: "slide-from-bottom 300ms",
        }}
      >
        <Flex px={[2, 4, 8]} py={3} align="center" justify="space-between">
          {(isMobile && isAuthenticated) && (
            <Icon
              aria-label={t('header.toggle_sidebar')}
              onClick={onToggleSidebar}
              cursor="pointer"
              mr={2}
              _active={{ color: "brand.500" }}
            >
              <LuMenu size={24} />
            </Icon>
          )}

          <Heading as="h1" size="md">
            {t('app.title')}
          </Heading>

          <Flex align="center" gap={2}>
            {isAuthenticated && user && (
              <Box onClick={handleOpenProfileModal} p={0.5} rounded="full" cursor="pointer" _hover={{ bg: "border.subtle" }}>
                <Avatar.Root size="xs" colorPalette={pickPalette(formatUserFullName(user))}>
                  <Avatar.Fallback name={formatUserFullName(user)} />
                  <Avatar.Image src="none" />
                </Avatar.Root>
              </Box>
            )}
          </Flex>
        </Flex>
      </Box >)}

      <Box h={`${headerHeight.current}px`} />

      {isAuthenticated && user && (
        <DialogRoot size="lg" open={isProfileModalOpen} onOpenChange={() => setIsProfileModalOpen(false)}>
          <DialogBackdrop />
          <DialogContent ref={dialogContentRef}>
            <DialogHeader borderBottomWidth={1}>
              <DialogTitle>{t('header.user_profile')}</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody>
              {user && <UserProfile selectContainerRef={dialogContentRef as RefObject<HTMLDivElement>} onClose={handleCloseProfileModal} />}
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      )}
    </>
  );
};
