import { useApiRequest } from './use-api-request';
import { categoryApi } from '@api/category.api';
import { useCategoryStore } from '@store/category.store';
import type { Category, CategoryApiItem, CategoryDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useCategories = () => {
  const { t } = useTranslation();
  const {
    data: categories,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchCategories: storeFetchCategories,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useCategoryStore();

  const getStoreCategories = (): Category[] => {
    if(categories === null) return [];
    return categories;
  }

  const fetchCategoriesRequest = useApiRequest<CategoryApiItem[], QueryParams>(
    (params) => categoryApi.getAll(params),
    {
      errorMessage: t('categories.errors.load_failed'),
      onSuccess: () => {
        storeFetchCategories();
      }
    }
  );

  const fetchPaginatedCategoriesRequest = useApiRequest<PaginatedResponse<CategoryApiItem>, QueryParams>(
    (params) => categoryApi.getPaginated(params),
    {
      errorMessage: t('categories.errors.load_failed'),
    }
  );

  const fetchCategoryByIdRequest = useApiRequest<CategoryApiItem, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return categoryApi.getById(id);
    },
    {
      errorMessage: t('categories.errors.load_single_failed')
    }
  );

  const createCategoryRequest = useApiRequest<CategoryApiItem, CategoryDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return categoryApi.create(params);
    },
    {
      successMessage: t('categories.success.created'),
      errorMessage: t('categories.errors.create_failed'),
      onSuccess: () => {
        storeFetchCategories();
      }
    }
  );

  const updateCategoryRequest = useApiRequest<CategoryApiItem, { id: number, category: CategoryDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await categoryApi.update(params.id, params.category);
    },
    {
      successMessage: t('categories.success.updated'),
      errorMessage: t('categories.errors.update_failed'),
      onSuccess: () => {
        storeFetchCategories();
      }
    }
  );

  const deleteCategoryRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return categoryApi.delete(id);
    },
    {
      successMessage: t('categories.success.deleted'),
      errorMessage: t('categories.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchCategories();
        
        if (selectedCategoryId === result.id) {
          setSelectedCategoryId(null);
        }
      }
    }
  );

  const fetchCategoryHierarchyRequest = useApiRequest<Category[], void>(
    () => categoryApi.getHierarchicalTree(),
    {
      errorMessage: t('categories.errors.hierarchy_load_failed')
    }
  );

  const hasChildrenRequest = useApiRequest<boolean, number>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await categoryApi.hasChildren(params);
    },
    {
      errorMessage: t('categories.errors.hierarchy_load_failed')
    }
  )

  return {
    // Store state
    categories,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedCategoryId,
    setSelectedCategoryId,

    storeFetchCategories,
    getStoreCategories,

    hasChildrenRequest,
    
    // API Request objects
    fetchCategoriesRequest,
    fetchPaginatedCategoriesRequest,
    fetchCategoryByIdRequest,
    fetchCategoryHierarchyRequest,
    createCategoryRequest,
    updateCategoryRequest,
    deleteCategoryRequest
  };
};