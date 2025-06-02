import { useEffect, type RefObject } from 'react';
import { productSchema, type ProductDTO, type ProductDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { useProducts } from '@hooks/use-products';
import { useCategories } from '@hooks/use-categories';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureIdArray, getFirstId } from '@utils/id-helper';

export const ProductFormUpdate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    fetchProductByIdRequest,
    updateProductRequest,
  } = useProducts();

  const {
    fetchCategoriesRequest,
  } = useCategories();

  const {
    data: categories,
    execute: fetchCategories,
    isLoading: isLoadingCategories
  } = fetchCategoriesRequest;

  const {
    execute: fetchProductById,
    data: product,
    error: fetchError,
    isLoading: isLoadingProduct
  } = fetchProductByIdRequest;

  const {
    execute: updateProduct,
    isLoading: isLoadingProductUpdate
  } = updateProductRequest;

  useEffect(() => {
    if (id) {
      fetchProductById(Number(id));
    }
    fetchCategories();
  
  }, [id]);

  const safeCategories = categories ?? [];

  const categoryOptions = createListCollection({
    items: safeCategories.map(category => ({ value: category.id, label: category.name }))
  });

  const field = makeField<ProductDTOForm>();

  const fields = [
    field({
      name: 'reference' as const,
      label: t('products.form.reference'),
      type: 'text' as const,
      placeholder: t('products.form.reference_placeholder'),
      required: true
    }),
    field({
      name: 'part_number' as const,
      label: t('products.form.part_number'),
      type: 'number' as const,
      placeholder: t('products.form.part_number_placeholder'),
      required: true
    }),
    field({
      name: 'unit_price_eur' as const,
      label: t('products.form.unit_price'),
      type: 'number' as const,
      placeholder: t('products.form.unit_price_placeholder'),
      required: true,
      step: 0.01
    }),
    field({
      name: 'category_id' as const,
      label: t('products.form.category'),
      type: 'select' as const,
      placeholder: t('products.form.category_placeholder'),
      contentRef: selectRef,
      required: true,
      multiple: false,
      options: categoryOptions,
    }),
    field({
      name: 'description' as const,
      label: t('products.form.description'),
      type: 'textarea' as const,
      placeholder: t('products.form.description_placeholder'),
      required: false
    }),
  ];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductDTOForm>({
    resolver: zodResolver(productSchema)
  });

  useEffect(() => {
    if (product) {
      reset({
        reference: product.reference,
        description: product.description || '',
        part_number: product.part_number || 0,
        unit_price_eur: product.unit_price_eur,
        category_id: ensureIdArray(product.category_id?.id)
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductDTOForm) => {
    if (!id) return;

    const cat_id = getFirstId(data.category_id);
    
    // Conversion des types pour correspondre à l'interface ProductDTO
    const formattedData: ProductDTO = {
      reference: data.reference,
      description: data.description,
      part_number: data.part_number,
      unit_price_eur: data.unit_price_eur,
      category_id: cat_id
    };
    
    await updateProduct({ id: Number(id), product: formattedData });
    navigate("/products");
  }

  if (isLoadingProduct || isLoadingCategories) {
    return <LoadingSpinner />;
  }

  if (fetchError) {
    return <div>{t('products.form.error_loading', { error: fetchError.message })}</div>;
  }

  if (!product) {
    return <div>{t('products.form.not_found')}</div>;
  }

  return (
    <SimpleForm<ProductDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/products"
      isSubmitting={isSubmitting || isLoadingProductUpdate}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
