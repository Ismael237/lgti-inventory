import {
  Table,
  Box,
  Text,
  Flex,
  Button,
  createListCollection,
  ButtonGroup
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useColorModeValue } from '@ui/chakra/color-mode';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from './chakra/select';
import { ContextMenuWrapper, type ContextMenuConfig } from './context-menu';

interface SelectPageSizeProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const SelectPageSize = ({ pageSize, onPageSizeChange }: SelectPageSizeProps) => {
  const pageSizeCollection = createListCollection({
    items: [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "20", value: 20 },
      { label: "50", value: 50 },
    ],
    itemToString: (item) => `${item.label}`,
    itemToValue: (item) => item.value.toString(),
  });

  return (
    <SelectRoot
    value={[pageSize.toString()]}
      onValueChange={({ value }) => onPageSizeChange(Number(value[0]))}
      collection={pageSizeCollection}
      w={["100px", "75px"]}
    >
      <SelectTrigger>
        <SelectValueText />
      </SelectTrigger>
      <SelectContent>
        {pageSizeCollection?.items.map(option => (
          <SelectItem key={String(option.value)} item={option}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  isNumeric?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  contextMenuConfig?: ContextMenuConfig<T>;
  enableContextMenu?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  total = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  keyExtractor,
  emptyMessage,
  contextMenuConfig,
  enableContextMenu = false
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const defaultEmptyMessage = t('common.noData');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const totalPages = Math.ceil(total / pageSize);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor] as React.ReactNode;
  };

  const renderRow = (item: T) => {
    const rowContent = (
      <Table.Row cursor="pointer" key={keyExtractor(item)}>
        {columns.map((column, index) => (
          <Table.Cell key={index}>
            {renderCell(item, column)}
          </Table.Cell>
        ))}
      </Table.Row>
    );

    if (enableContextMenu && contextMenuConfig) {
      return (
        <ContextMenuWrapper
          key={keyExtractor(item)}
          item={item}
          config={contextMenuConfig}
        >
          {rowContent}
        </ContextMenuWrapper>
      );
    }

    return rowContent;
  };

  const handlePageSizeChange = (pageSize: number) => {
    if(onPageSizeChange && onPageChange){
      onPageSizeChange(pageSize);
      onPageChange(1);
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      overflow="hidden"
    >
      <Box>
        <Table.ScrollArea>
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row bg="bg.muted">
                {columns.map((column, index) => (
                  <Table.ColumnHeader key={index}>
                    {column.header}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={columns.length} textAlign="center" py={8}>
                    <Text color="gray.500">{emptyMessage || defaultEmptyMessage}</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.map((item) => renderRow(item))
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>

      {total > 0 && onPageChange && (
        <Flex
          justify="space-between"
          alignItems={["center"]}
          px={[2, 4, 6]} py={4}
          borderTopWidth="1px"
          borderColor="border.emphasized"
          flexWrap="wrap"
          gap={4}
        >
          <Text fontSize="sm" color="gray.500">
            {t('data_table.showing_results', { startItem, endItem, total })}
          </Text>

          <Flex align="center" gap={4} flexWrap="wrap">
            {onPageSizeChange && (
              <SelectPageSize
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
              />
            )}
            <ButtonGroup>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                mr={2}
              >
                <LuChevronLeft size={16} />
                {t('data_table.previous')}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('data_table.next')}
                <LuChevronRight size={16} />
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}