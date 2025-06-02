import React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from './chakra/menu';
import { Link } from 'react-router-dom';
import { LuDownload, LuPlus } from 'react-icons/lu';
import { Button } from './chakra/button';

export interface ActionMenuItem {
  label: string;
  to: string;
  icon?: React.ReactElement;
  color?: string;
}

interface ActionMenuProps {
  items?: ActionMenuItem[];
  isLoading?: boolean;
  addLabel?: string;
  buttonText?: string;
  baseUrl?: string;
  placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
  addUrl?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  buttonText,
  placement = 'bottom-end',
  baseUrl,
  addLabel,
  isLoading,
  addUrl
}) => {
  const { t } = useTranslation();
  const displayText = buttonText || t('actions.menu_title');

  const allItems: ActionMenuItem[] = [
    {
      label: addLabel || t('actions.add'),
      icon: <LuPlus />,
      to: addUrl || `${baseUrl}/new`,
    },
    ...items || [],
    {
      label: t('actions.export'),
      icon: <LuDownload />,
      to: `${baseUrl}/export`,
      color: "gray.500"
    },
  ];
  return (
    <MenuRoot positioning={{ placement }}>
      <MenuTrigger asChild>
        <Button loading={isLoading} loadingText={t('common.loading')} size="sm" variant="outline">
          {displayText}
        </Button>
      </MenuTrigger>
      <MenuContent>
        {allItems.map((item) => (
          <MenuItem
            key={item.to}
            value={item.to}
            color={item.color || "brand.500"}
            cursor="pointer"
            asChild
          >
            <Link to={item.to}>
              {item.icon}
              <Box flex="1">{item.label}</Box>
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
};
