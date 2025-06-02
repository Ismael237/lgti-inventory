import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
} from '@chakra-ui/react';

import { useCategories } from '@hooks/use-categories';
import { ErrorDisplay } from '@ui/error-display';
import { LoadingSpinner } from '@ui/loading-spinner';
import { formatDate, formatDateWithFallback, formatUserFullName } from '@utils/format';
import { DataListRoot, DataListItem } from '@ui/chakra/data-list';

const CategoryDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    fetchCategoryByIdRequest,
    fetchCategoryHierarchyRequest,
    hasChildrenRequest
  } = useCategories();
  
  const {
    execute: fetchCategoryById,
    data: category,
    error,
    isLoading
  } = fetchCategoryByIdRequest;

  const {
    execute: fetchHierarchy,
    data: hierarchyData,
    isLoading: hierarchyLoading
  } = fetchCategoryHierarchyRequest;

  const {
    execute: checkHasChildren,
    data: hasChildrenData,
    isLoading: childrenCheckLoading
  } = hasChildrenRequest;

  useEffect(() => {
    if (id) {
      const categoryId = Number(id);
      fetchCategoryById(categoryId);
      fetchHierarchy();
      checkHasChildren(categoryId);
    }
  }, [id]);

  if (isLoading && !category) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={() => fetchCategoryById(Number(id))} />;
  }

  if (!category) {
    return <Box>{t('categories.details.not_found')}</Box>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Stack gap={6} align="stretch">
        <Heading as="h2" size="lg">{category.name}</Heading>
        
        <DataListRoot orientation="horizontal" w="full">
          <DataListItem
            label={t('common.id')}
            value={category.id}
          />
          
          <DataListItem
            label={t('categories.details.parent_category')}
            value={
              category.parent_id ? (
                <Text>{category.parent_id.name}</Text>
              ) : (
                <Badge colorPalette="brand">{t('categories.details.root_category')}</Badge>
              )
            }
            info={t('categories.details.parent_info')}
          />

          <DataListItem
            label={t('categories.details.has_children')}
            value={
              childrenCheckLoading ? (
                <Text>{t('common.checking')}</Text>
              ) : hasChildrenData ? (
                <Badge colorPalette="green">{t('common.yes')}</Badge>
              ) : (
                <Badge colorPalette="red">{t('common.no')}</Badge>
              )
            }
            info={t('categories.details.children_info')}
          />
          
          <DataListItem
            label={t('common.created_at')}
            value={formatDate(category.date_created)}
          />

          <DataListItem
            label={t('common.created_by')}
            value={formatUserFullName(category.user_created)}
          />
          
          <DataListItem
            label={t('common.last_updated')}
            value={formatDateWithFallback(category.date_updated)}
          />
          
          <DataListItem
            label={t('common.updated_by')}
            value={formatUserFullName(category.user_updated)}
          />
        </DataListRoot>

        {hierarchyLoading ? (
          <LoadingSpinner size="sm" />
        ) : hierarchyData && hierarchyData.length > 0 && (
          <Box mt={4}>
            <Heading as="h3" size="md" mb={2}>{t('categories.details.hierarchy_position')}</Heading>
            <Text>{t('categories.details.hierarchy_description')}</Text>
            <Box p={2} mt={2} borderWidth="1px" borderRadius="md">
              {/* Simplified hierarchy visualization */}
              <Text fontStyle="italic" color="gray.600">
                {hierarchyData.find(cat => cat.id === category.id) ?
                  t('categories.details.root_level') :
                  t('categories.details.nested_under', { parent: category.parent_id?.name || t('common.unknown') })
                }
              </Text>
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default CategoryDetails;
