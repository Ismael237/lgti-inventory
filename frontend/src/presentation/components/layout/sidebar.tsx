import { Box, VStack, Text, Flex, Icon, Drawer, Portal, CloseButton } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LuHouse,
  LuDatabase,
  LuTag,
  LuArrowRightLeft,
  LuChartColumn,
  LuUsers,
  LuFileText,
  LuChartPie
} from 'react-icons/lu';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { LgtiLogo } from '@ui/assets/LgtiLogo';

interface SidebarProps extends BoxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
}

interface NavSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    path: string;
  }[];
}

const getNavConfig = (t: (key: string) => string): NavSection[] => [
  {
    title: t('actions.menu_title'),
    items: [
      { icon: LuHouse, label: t('nav.home'), path: '/' },
      { icon: LuTag, label: t('nav.categories'), path: '/categories' },
      { icon: LuDatabase, label: t('nav.products'), path: '/products' },
      { icon: LuUsers, label: t('nav.partners'), path: '/partners' },
      { icon: LuArrowRightLeft, label: t('nav.movements'), path: '/movements' },
      { icon: LuChartPie, label: t('nav.product_movement_stats'), path: '/products/movement-stats' },
      { icon: LuChartColumn, label: t('nav.simulations'), path: '/price-simulations' },
      { icon: LuFileText, label: t('nav.documents'), path: '/documents' },
    ]
  }
];

const NavItem = ({ icon, children, to }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'brand.900');

  return (
    <Link to={to} style={{ width: '100%' }}>
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="md"
        role="group"
        cursor="pointer"
        _hover={{ bg: hoverBg }}
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : undefined}
        fontWeight={isActive ? 'semibold' : 'normal'}
      >
        <Icon as={icon} mr="3" fontSize="16" />
        <Text fontSize="sm">{children}</Text>
      </Flex>
    </Link>
  );
};

const NavSection = ({ title, items }: NavSection) => {
  return (
    <>
      <Box px="5" py="2">
        <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" color="gray.500">
          {title}
        </Text>
      </Box>
      {items.map((item, index) => (
        <NavItem key={index} icon={item.icon} to={item.path}>
          {item.label}
        </NavItem>
      ))}
    </>
  );
};

export const SidebarContent = () => {
  const { t } = useTranslation();
  const navConfig = getNavConfig(t);

  return (
    <VStack gap={1} align="stretch" pb="4" w="full">
      <Flex
        mb={4}
        h="61px"
        borderBottomWidth={1}
        borderColor="border.emphasized"
        alignItems="center"
        pl={5}
      >
        <LgtiLogo size={0.7} />
      </Flex>
      {navConfig.map((section, index) => (
        <NavSection key={index} title={section.title} items={section.items} />
      ))}
    </VStack>
  );
};

export const SidebarMobile = ({ isOpen, onClose }: SidebarProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onClose}
      trapFocus={false}
      placement="start"
      size="xs"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="225px" bg={bgColor}>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            <Drawer.Body p={0} display="flex" flexDirection="column" maxH="100%">
              <SidebarContent />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export const Sidebar = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  return (
    <Flex
      w="full"
      maxW="226px"
      pos="fixed"
      top="0"
      left="0"
      bg={bgColor}
      borderColor="border"
      h="100vh"
      overflowY="scroll"
      borderRightWidth={1}
    >
      <SidebarContent />
    </Flex>
  );
};