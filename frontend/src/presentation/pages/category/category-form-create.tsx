import { useEffect, type RefObject } from 'react';
import { categorySchema, type CategoryDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { useCategories } from '@hooks/use-categories';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { getFirstId } from '@utils/id-helper';

export const CategoryFormCreate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    fetchCategoriesRequest,
    createCategoryRequest,
  } = useCategories();

  const {
    data: categories,
    execute: fetchCategories,
    isLoading: isLoadingCategories
  } = fetchCategoriesRequest;

  const {
    execute: createCategory,
    isLoading: isLoadingCategoriesCreation
  } = createCategoryRequest;

  useEffect(() => {
    fetchCategories();

  }, []);

  const safeCategories = categories ?? [];

  const parentOptions = createListCollection({
    items: safeCategories.map(cat => ({ value: cat.id, label: cat.name }))
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
      required: true,
      multiple: false,
      options: parentOptions,
    })
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CategoryDTOForm>({
    resolver: zodResolver(categorySchema)
  });

  const onSubmit = async ({ name, parent_id }: CategoryDTOForm) => {
    const p_id = getFirstId(parent_id);
    
    await createCategory({ name, parent_id: p_id });
    navigate("/categories");
  }

  if (isLoadingCategories) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleForm<CategoryDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/categories"
      isSubmitting={isSubmitting || isLoadingCategoriesCreation}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};