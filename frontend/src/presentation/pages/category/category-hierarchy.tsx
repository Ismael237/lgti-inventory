import { useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuFolder, LuFolderOpen } from 'react-icons/lu';

import { useCategories } from '@hooks/use-categories';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import type { Category } from '@entities';
import {
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent
} from '@ui/chakra/accordion';

const CategoryTree = ({ node, level = 0 }: {
  node: Category;
  level?: number;
}) => {
  const {
    id,
    name,
    children
  } = node;
  const hasChildren = children && children.length > 0;
  const paddingLeft = `${level * 30}px`;

  return (
    <AccordionRoot
      multiple
      defaultValue={[`category-${id}`]}
    >
      <AccordionItem borderBottomWidth={0} value={`category-${id}`} pl={paddingLeft}>
        <AccordionItemTrigger
          indicatorPlacement="start"
          cursor="pointer"
        >
          <Flex align="center" width="full">
            <Icon
              as={hasChildren ? (level === 0 ? LuFolderOpen : LuFolder) : LuFolder}
              color="brand.500"
              mr={2}
            />
            <Text fontWeight={level === 0 ? "bold" : "normal"}>
              {name}
            </Text>
          </Flex>
        </AccordionItemTrigger>

        {hasChildren && (
          <AccordionItemContent pb={0} pt={0}>
            <Box>
              {hasChildren && (children.map((child) => (
                <CategoryTree
                  key={child.id}
                  node={child}
                  level={level + 1}
                />
              )))}
            </Box>
          </AccordionItemContent>
        )}
      </AccordionItem>

    </AccordionRoot>
  );
};

const CategoryHierarchy = () => {
  const { t } = useTranslation();
  const {
    fetchCategoryHierarchyRequest,
  } = useCategories();

  const {
    execute: fetchCategoryHierarchy,
    data: categoryTree,
    isLoading,
    error
  } = fetchCategoryHierarchyRequest;

  useEffect(() => {
    fetchCategoryHierarchy();
  
  }, []);

  if (isLoading && (!categoryTree || categoryTree.length === 0)) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchCategoryHierarchy()} />;
  }

  if (!categoryTree || categoryTree.length === 0) {
    return <Box>{t('categories.hierarchy.no_categories')}</Box>;
  }

  return (
    <Box>
      <Flex>
        <Box
          width="100%"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          bg="white"
          overflowY="auto"
        >
          {categoryTree.map(node => (
            <CategoryTree
              key={node.id}
              node={node}
            />
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

export default CategoryHierarchy;