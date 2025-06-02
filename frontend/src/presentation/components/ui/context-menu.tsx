import {
  Box,
  HStack,
  Menu,
  Portal,
  useDisclosure
} from '@chakra-ui/react';
import { LuEye, LuPenLine, LuTrash2 } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface ActionOption {
  label: string;
  icon: React.ReactElement;
  onClick?: () => void;
  to?: string;
  status?: "danger" | undefined;
}

export interface ContextMenuConfig<T> {
  viewUrl?: (item: T) => string;
  editUrl?: (item: T) => string;
  deleteUrl?: (item: T) => string;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  viewIcon?: React.ReactElement;
  editIcon?: React.ReactElement;
  deleteIcon?: React.ReactElement;
  additionalOptions?: (item: T) => ActionOption[];
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
}

interface ContextMenuWrapperProps<T> {
  item: T;
  config: ContextMenuConfig<T>;
  children: React.ReactNode;
}

export function ContextMenuWrapper<T>({
  item,
  config,
  children
}: ContextMenuWrapperProps<T>) {
  const { t } = useTranslation();
  const { open: isOpen, onOpen, onClose, setOpen } = useDisclosure();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    viewUrl,
    editUrl,
    deleteUrl,
    viewLabel,
    editLabel,
    deleteLabel,
    viewIcon,
    editIcon,
    deleteIcon,
    additionalOptions = () => [],
    onDelete,
    onEdit,
    onView
  } = config;

  const buildOptions = (): ActionOption[] => {
    const options: ActionOption[] = [];

    options.push(...additionalOptions(item));

    if (viewUrl || onView) {
      options.push({
        label: viewLabel || t('actions.view'),
        icon: viewIcon || <LuEye />,
        to: viewUrl?.(item),
        onClick: onView ? () => onView(item) : undefined
      });
    }

    if (editUrl || onEdit) {
      options.push({
        label: editLabel || t('actions.edit'),
        icon: editIcon || <LuPenLine />,
        to: editUrl?.(item),
        onClick: onEdit ? () => onEdit(item) : undefined
      });
    }

    if (deleteUrl || onDelete) {
      options.push({
        label: deleteLabel || t('actions.delete'),
        icon: deleteIcon || <LuTrash2 />,
        to: deleteUrl?.(item),
        onClick: onDelete ? () => onDelete(item) : undefined,
        status: "danger"
      });
    }

    return options;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const options = buildOptions();
    if (options.length === 0) return;

    const closeEvent = new CustomEvent('closeAllContextMenus', { detail: { exceptId: triggerRef.current?.id } });
    document.dispatchEvent(closeEvent);
    
    setPosition({ x: e.clientX, y: e.clientY });
    onOpen();
  };

  const handleClick = () => {
    const url = viewUrl?.(item);
    if (url) {
      navigate(url);
    }
  };

  const handleCloseMenu = () => {
    onClose();
  };

  useEffect(() => {
    const closeAllMenus = (e: Event) => {
      const customEvent = e as CustomEvent;
      const exceptId = customEvent.detail?.exceptId;
      
      if (triggerRef.current?.id !== exceptId) {
        setOpen(false);
      }
    };
    
    document.addEventListener('closeAllContextMenus', closeAllMenus);
    
    return () => {
      document.removeEventListener('closeAllContextMenus', closeAllMenus);
    };
  }, [setOpen]);

  const handleItemClick = (option: ActionOption) => {
    if (option.onClick) {
      option.onClick();
    }
    handleCloseMenu();
  };

  const options = buildOptions();

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
    <>
      <Box
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        cursor="pointer"
        w="100%"
        asChild
        _hover={{
          backgroundColor: "brand.50",
          transition: "background-color 0.2s ease"
        }}
        bg={isOpen ? "brand.100" : "transparent"}
        id={`context-menu-${Math.random().toString(36).substr(2, 9)}`}
      >
        {children}
      </Box>

      <Menu.Root
        open={isOpen}
        onOpenChange={({ open }) => setOpen(open)}
        positioning={{
          strategy: "fixed",
          placement: "bottom-start",
          offset: { mainAxis: 0, crossAxis: 0 }
        }}
      >
        <Portal>
          <Menu.Positioner
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 9999
            }}
          >
            <Menu.Content w="250px" p={1} py={2}>
              {options.map((option, index) => {
                const menuItemContent = (
                  <HStack gap={4} >
                    {option.icon}
                    {option.label}
                  </HStack>
                );
                
                return option.to ? (
                  <Menu.Item
                    asChild
                    value={option.label}
                    key={index}
                    {...menuItemStyle(option.status)}
                    cursor="pointer"
                    onClick={handleCloseMenu}
                    px={5}
                    py={2}
                    _hover={{
                      backgroundColor: option.status === "danger" ? "red.100" : "brand.50",
                    }}
                  >
                    <Link to={option.to}>
                      {menuItemContent}
                    </Link>
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    value={option.label}
                    key={index}
                    onClick={() => handleItemClick(option)}
                    {...menuItemStyle(option.status)}
                    cursor="pointer"
                    px={5}
                    py={2}
                    _hover={{
                      backgroundColor: option.status === "danger" ? "red.100" : "brand.50"
                    }}
                  >
                    {menuItemContent}
                  </Menu.Item>
                );
              })}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
}
