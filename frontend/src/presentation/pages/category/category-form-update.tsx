import { useEffect, type RefObject } from 'react';
import { categorySchema, type CategoryDTO, type CategoryDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { useCategories } from '@hooks/use-categories';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureIdArray, getFirstId } from '@utils/id-helper';

export const CategoryFormUpdate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? parseInt(id, 10) : undefined;

  const {
    fetchCategoriesRequest,
    fetchCategoryByIdRequest,
    updateCategoryRequest,
  } = useCategories();

  const {
    data: categories,
    execute: fetchCategories,
    isLoading: isLoadingCategories
  } = fetchCategoriesRequest;

  const {
    data: categoryData,
    execute: fetchCategory,
    isLoading: isLoadingCategory
  } = fetchCategoryByIdRequest;

  const {
    execute: updateCategory,
    isLoading: isLoadingCategoryUpdate
  } = updateCategoryRequest;

  useEffect(() => {
    fetchCategories();
    if (categoryId) {
      fetchCategory(categoryId);
    }

  }, [categoryId]);

  const safeCategories = categories ?? [];

  const parentOptions = createListCollection({
    items: safeCategories
      .filter(cat => cat.id !== categoryId)
      .map(cat => ({ value: cat.id, label: cat.name }))
  });

  const field = makeField<CategoryDTOForm>();

  const fields = [
    field({
      name: 'name' as const,
      label: t('categories.form.name'),
      type: 'text' as const,
      placeholder: t('categories.form.name_placeholder'),
      required: true
    }),
    field({
      name: 'parent_id' as const,
      label: t('categories.form.parent_category'),
      type: 'select' as const,
      placeholder: t('categories.form.parent_placeholder'),
      contentRef: selectRef,
      required: false,
      multiple: false,
      options: parentOptions,
    })
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CategoryDTOForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name,
        parent_id: ensureIdArray(categoryData.parent_id?.id)
      });
    }
  }, [categoryData, reset]);

  const onSubmit = async ({ name, parent_id }: CategoryDTOForm) => {
    if (!categoryId) return;

    const formattedData: CategoryDTO = {
      name,
      parent_id: getFirstId(parent_id),
    };

    await updateCategory({
      id: categoryId,
      category: formattedData
    });

    navigate("/categories");
  }

  if (isLoadingCategories || isLoadingCategory) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleForm<CategoryDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/categories"
      isSubmitting={isSubmitting || isLoadingCategoryUpdate}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};