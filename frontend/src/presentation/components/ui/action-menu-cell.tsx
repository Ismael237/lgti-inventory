import React from 'react';
import {
  Menu,
  IconButton,
  Portal
} from '@chakra-ui/react';
import { LuEllipsisVertical } from 'react-icons/lu';
import { Link } from 'react-router-dom';

export interface ActionOption {
  label: string;
  icon: React.ReactElement;
  onClick?: () => void;
  to?: string;
  status?: "danger" | undefined;
}

interface ActionMenuCellProps {
  options: ActionOption[];
  ariaLabel?: string;
  menuButtonSize?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const ActionMenuCell: React.FC<ActionMenuCellProps> = ({
  options,
  ariaLabel = "Options",
  menuButtonSize = "sm"
}) => {

  const menuItemStyle = (status: ActionOption["status"]) => {
    switch (status) {
      case "danger":
        return {
          color: "red.500",
          _hover: {
            backgroundColor: "red.100"
          }
        };
      default:
        return {};
    }
  };


  return (
    <Menu.Root positioning={{ placement: "left-start" }}>
      <Menu.Trigger asChild>
        <IconButton size={menuButtonSize} variant="ghost" aria-label={ariaLabel}>
          <LuEllipsisVertical size={16} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {options.map((option, index) => {
              const menuItemContent = (
                <>
                  {option.icon}
                  {option.label}
                </>
              );
              
              return option.to ? (
                <Menu.Item
                  asChild
                  value={option.label}
                  key={index}
                  {...menuItemStyle(option.status)}
                  cursor="pointer"
                >
                  <Link to={option.to}>
                    {menuItemContent}
                  </Link>
                </Menu.Item>
              ) : (
                <Menu.Item
                  value={option.label}
                  key={index}
                  onClick={option.onClick}
                  {...menuItemStyle(option.status)}
                  cursor="pointer"
                >
                  {menuItemContent}
                </Menu.Item>
              );
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
};