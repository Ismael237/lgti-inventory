import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@i18n/config';
import {
  Avatar,
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  Icon,
  Button,
  createListCollection,
  Flex,
  Tabs,
  SimpleGrid,
} from '@chakra-ui/react';
import { useAuth } from '@hooks/use-auth';
import { formatDateWithFallback, formatUserFullName } from '@utils/format';
import {
  LuCalendar,
  LuMail,
  LuUser,
  LuGlobe,
  LuSettings,
  LuLogOut
} from 'react-icons/lu';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@ui/chakra/select';
import { pickPalette } from '@utils/theme';
import type { DirectusUser } from '@directus/sdk';
import { useColorMode, type ColorMode } from '@ui/chakra/color-mode';
import { useToast } from '@hooks/use-toast';

const ProfileHeader = ({ user }: { user: DirectusUser }) => {
  return (
    <HStack gap={4} align="center" width="100%" mb={4}>
      <Avatar.Root size="md" colorPalette={pickPalette(formatUserFullName(user))}>
        <Avatar.Fallback name={formatUserFullName(user)} />
        <Avatar.Image src="none" />
      </Avatar.Root>
      <Box>
        <Text fontWeight="bold" fontSize="xl">
          {formatUserFullName(user)}
        </Text>
        {user.title && (
          <Text fontSize="sm" color="gray.500">
            {user.title}
          </Text>
        )}
      </Box>
    </HStack>
  );
};

const UserInfo = ({ user }: { user: DirectusUser }) => {
  const { t } = useTranslation();

  return (
    <VStack align="stretch" gap={4} width="100%">
      <HStack>
        <Icon as={LuMail} color="brand.500" />
        <Text fontWeight="semibold">{t('profile.email')}:</Text>
        <Text>{user.email}</Text>
      </HStack>

      {user.role && typeof user.role === 'object' && 'name' in user.role && (
        <HStack>
          <Icon as={LuUser} color="purple.500" />
          <Text fontWeight="semibold">{t('profile.role')}:</Text>
          <Badge colorPalette="purple">{user.role.name}</Badge>
        </HStack>
      )}

      {user.last_access && (
        <HStack>
          <Icon as={LuCalendar} color="green.500" />
          <Text fontWeight="semibold">{t('profile.last_login')}:</Text>
          <Text>{formatDateWithFallback(user.last_access, undefined, t('profile.not_available'))}</Text>
        </HStack>
      )}

      {user.language && (
        <HStack>
          <Icon as={LuGlobe} color="teal.500" />
          <Text fontWeight="semibold">{t('profile.preferred_language')}:</Text>
          <Text>{user.language === 'fr' ? 'Français' : 'English'}</Text>
        </HStack>
      )}
    </VStack>
  );
};

interface UserSettingsProps {
  selectContainerRef?: RefObject<HTMLDivElement>
}

const UserSettings = ({ selectContainerRef }: UserSettingsProps) => {
  const { t } = useTranslation();
  const { colorMode, setColorMode } = useColorMode();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languageOptions = createListCollection({
    items: [
      { value: 'fr', label: 'Français', flag: "🇫🇷" },
      { value: 'en', label: 'English', flag: "🇬🇧" }
    ],
    itemToString: (item) => `${item.flag} ${item.label}`,
    itemToValue: (item) => item.value,
  });

  const themeOptions = createListCollection({
    items: [
      { value: 'light', label: 'Light', icon: "🔆" },
      { value: 'dark', label: 'Dark', icon: "🌙" }
    ],
    itemToString: (item) => `${item.icon} ${item.label}`,
    itemToValue: (item) => item.value,
  });

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  const handleThemeChange = (theme: ColorMode) => {
    setColorMode(theme);
  };

  return (
    <SimpleGrid columns={2} row={2} rowGap={8}>
      <Text fontWeight="semibold" mb={2}>{t('profile.preferred_language')}</Text>
      <Box>
        <SelectRoot
          value={[currentLanguage]}
          onValueChange={(e) => handleLanguageChange(e.value[0])}
          collection={languageOptions}
          size="md"
        >
          <SelectTrigger cursor="pointer">
            <SelectValueText />
          </SelectTrigger>
          <SelectContent portalRef={selectContainerRef}>
            {languageOptions.items.map((item) => (
              <SelectItem cursor="pointer" key={item.value} item={item}>
                {item.flag}  {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>
      <Text fontWeight="semibold" mb={2}>{t('profile.preferred_theme')}</Text>

      <Box>
        <SelectRoot
          value={[colorMode]}
          onValueChange={(e) => handleThemeChange(e.value[0] as ColorMode)}
          collection={themeOptions}
          size="md"
        >
          <SelectTrigger cursor="pointer">
            <SelectValueText />
          </SelectTrigger>
          <SelectContent portalRef={selectContainerRef}>
            {themeOptions.items.map((item) => (
              <SelectItem cursor="pointer" key={item.value} item={item}>
                {item.icon}  {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>
    </SimpleGrid>
  );
};

interface UserProfileProps {
  onClose: () => void;
  selectContainerRef?: RefObject<HTMLDivElement>
}

export const UserProfile = ({ selectContainerRef }: UserProfileProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const { showPromiseToast } = useToast();
  if (!user) return null;


  const handleLogout = async () => {
    if (logout) {
      showPromiseToast<boolean>(
        logout(),
        {
          success: { title: t('auth.logout.success') },
          loading: { title: t('auth.logout.loading') },
          error: { title: t('auth.logout.error') },
        }
      )
    }
  };

  return (
    <Flex width="100%" flexDirection="column" gap={4} pt={4}>
      <Tabs.Root
        variant="subtle"
        colorPalette="brand"
        width="100%"
        orientation="vertical"
        defaultValue="information"
      >
        <Tabs.List gap={4} pr={4}>
          <Tabs.Trigger value="information"  w="max-content">
            <Icon as={LuUser} mr={2} />
            {t('profile.info')}
          </Tabs.Trigger>
          <Tabs.Trigger value="settings">
            <Icon as={LuSettings} mr={2} />
            {t('profile.settings')}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content w="full" value="information" pl={4}>
          <ProfileHeader user={user} />
          <UserInfo user={user} />
        </Tabs.Content>
        <Tabs.Content w="full" value="settings" pl={4}>
          <UserSettings selectContainerRef={selectContainerRef} />
        </Tabs.Content>
      </Tabs.Root>

      <Flex justifyContent="flex-start" mt={1}>
        <Button
          colorPalette="red"
          variant="outline"
          onClick={handleLogout}
        >
          <Icon as={LuLogOut} />
          {t('auth.logout.label')}
        </Button>
      </Flex>
    </Flex>
  );
};