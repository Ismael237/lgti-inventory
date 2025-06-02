import { useApiRequest } from './use-api-request';
import { productApi } from '@api/product.api';
import { useProductStore } from '@store/product.store';
import type { Product, ProductApiItem, ProductDTO } from '@entities';
import type { QueryParams, PaginatedResponse } from '@types';
import { useTranslation } from 'react-i18next';

export const useProducts = () => {
  const { t } = useTranslation();
  const {
    data: products,
    loading: storeLoading,
    error: storeError,
    pagination,
    fetchProducts: storeFetchProducts,
    selectedProductId,
    setSelectedProductId,
  } = useProductStore();

  const getStoreProducts = (): Product[] => {
    if(products === null) return [];
    return products;
  }

  const fetchProductsRequest = useApiRequest<ProductApiItem[], QueryParams>(
    (params) => productApi.getAll(params),
    {
      errorMessage: t('products.errors.load_failed'),
    }
  );

  const fetchPaginatedProductsRequest = useApiRequest<PaginatedResponse<Product>, QueryParams>(
    (params) => productApi.getPaginated(params),
    {
      errorMessage: t('products.errors.load_failed'),
    }
  );

  const fetchProductByIdRequest = useApiRequest<Product, number>(
    (id) => {
      if (id === undefined) {
        throw new Error(t('common.errors.id_required'));
      }
      return productApi.getById(id);
    },
    {
      errorMessage: t('products.errors.load_single_failed')
    }
  );

  const createProductRequest = useApiRequest<ProductApiItem, ProductDTO>(
    (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return productApi.create(params);
    },
    {
      successMessage: t('products.success.created'),
      errorMessage: t('products.errors.create_failed'),
      onSuccess: () => {
        storeFetchProducts();
      }
    }
  );

  const updateProductRequest = useApiRequest<ProductApiItem, { id: number, product: ProductDTO }>(
    async (params) => {
      if (!params) throw new Error(t('common.errors.missing_parameters'));
      return await productApi.update(params.id, params.product);
    },
    {
      successMessage: t('products.success.updated'),
      errorMessage: t('products.errors.update_failed'),
      onSuccess: () => {
        storeFetchProducts();
      }
    }
  );

  const deleteProductRequest = useApiRequest<{ id: number }, number>(
    (id) => {
      if (id === undefined || id === null) {
        throw new Error(t('common.errors.id_required'));
      }
      return productApi.delete(id);
    },
    {
      successMessage: t('products.success.deleted'),
      errorMessage: t('products.errors.delete_failed'),
      onSuccess: (_, result) => {
        storeFetchProducts();
        
        if (selectedProductId === result.id) {
          setSelectedProductId(null);
        }
      }
    }
  );

  const fetchProductsByCategory = useApiRequest<ProductApiItem[], number>(
    (categoryId) => {
      if(!categoryId) throw new Error(t('common.errors.category_id_required'));
      return productApi.getProductsByCategory(categoryId)
    },
    {
      errorMessage: t('products.errors.load_by_category_failed')
    }
  );

  return {
    // Store state
    products,
    loading: storeLoading,
    error: storeError,
    pagination,
    selectedProductId,
    setSelectedProductId,

    storeFetchProducts,
    getStoreProducts,
    
    // API Request objects
    fetchProductsRequest,
    fetchPaginatedProductsRequest,
    fetchProductByIdRequest,
    createProductRequest,
    updateProductRequest,
    deleteProductRequest,
    fetchProductsByCategory,
  };
};
