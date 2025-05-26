import { useEffect, type RefObject } from 'react';
import { movementSchema, MovementType, type MovementDTO, type MovementDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { useMovements } from '@hooks/use-movements';
import { useProducts } from '@hooks/use-products';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureIdArray, getFirstId } from '@utils/id-helper';

export const MovementFormUpdate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    fetchMovementByIdRequest,
    updateMovementRequest,
  } = useMovements();

  const {
    fetchProductsRequest,
    fetchProductByIdRequest,
  } = useProducts();

  const {
    data: products,
    execute: fetchProducts,
    isLoading: isLoadingProducts
  } = fetchProductsRequest;

  const {
    execute: fetchMovementById,
    data: movement,
    error: fetchError,
    isLoading: isLoadingMovement
  } = fetchMovementByIdRequest;

  const {
    execute: updateMovement,
    isLoading: isLoadingMovementUpdate
  } = updateMovementRequest;

  const {
    data: product,
    isLoading: isLoadingProduct,
    execute: fetchProductById,
  } = fetchProductByIdRequest;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MovementDTOForm>({
    resolver: zodResolver(movementSchema)
  });

  const selectedProductId = watch('product_id');
  const selectedMovementType = watch('type');

  const safeProducts = products ?? [];

  const productOptions = createListCollection({
    items: safeProducts.map(product => ({ value: product.id, label: product.reference }))
  });

  const movementTypeOptions = createListCollection({
    items: [
      { value: 'IN', label: t('movements.types.in') },
      { value: 'OUT', label: t('movements.types.out') },
    ]
  });

  const field = makeField<MovementDTOForm>();

  const getStockHelperText = () => {
    const movementType = getFirstId(selectedMovementType);

    if (!selectedProductId) {
      return t('movements.form.select_product_first');
    }

    if (isLoadingProduct) {
      return t('movements.form.loading_stock');
    }

    if (product === null || product === undefined) {
      return t('movements.form.stock_unavailable');
    }

    let stockAfterSimulation = product.current_stock || 0;

    if (movement && selectedProductId) {
      const productId = getFirstId(selectedProductId);
      const originalProductId = movement.product_id?.id;

      if (productId === originalProductId) {
        if (movement.type === MovementType.OUT) {
          stockAfterSimulation += movement.quantity;
        } else if (movement.type === MovementType.IN) {
          stockAfterSimulation -= movement.quantity;
        }
      }
    }

    if (movementType === MovementType.OUT) {
      return t('movements.form.available_stock_out', {
        available: stockAfterSimulation,
      });
    } else if (movementType === MovementType.IN) {
      return t('movements.form.current_stock_in', {
        current: stockAfterSimulation,
      });
    }

    return t('movements.form.current_stock', {
      current: stockAfterSimulation,
    });
  };

  const fields = [
    field({
      name: 'type' as const,
      label: t('movements.form.type'),
      type: 'select' as const,
      placeholder: t('movements.form.type_placeholder'),
      contentRef: selectRef,
      required: true,
      multiple: false,
      options: movementTypeOptions,
    }),
    field({
      name: 'product_id' as const,
      label: t('movements.form.product'),
      type: 'select' as const,
      placeholder: t('movements.form.product_placeholder'),
      contentRef: selectRef,
      required: true,
      multiple: false,
      options: productOptions,
      helperText: getStockHelperText(),
    }),
    field({
      name: 'quantity' as const,
      label: t('movements.form.quantity'),
      type: 'number' as const,
      placeholder: t('movements.form.quantity_placeholder'),
      required: true
    }),
    field({
      name: 'notes' as const,
      label: t('movements.form.notes'),
      type: 'textarea' as const,
      placeholder: t('movements.form.notes_placeholder'),
      required: false
    })
  ];

  const onSubmit = async (data: MovementDTOForm) => {
    if (!id || !movement) return;

    const productId = getFirstId(data.product_id);
    const movementType = getFirstId(data.type);

    if (!productId) throw Error(t('movements.form.product_missing'));
    if (!movementType) throw Error(t('movements.form.type_missing'));

    if (movementType === MovementType.OUT) {
      const currentStock = await fetchProductById(productId);

      let stockAfterUpdate = currentStock?.current_stock || 0;

      if (movement.type === MovementType.OUT) {
        stockAfterUpdate += movement.quantity;
      }
      else if (movement.type === MovementType.IN) {
        stockAfterUpdate -= movement.quantity;
      }

      if (stockAfterUpdate < data.quantity) {
        setError("quantity", {
          type: "manual",
          message: t('movements.form.out_of_stock', {
            available: stockAfterUpdate,
            requested: data.quantity
          })
        });
        return;
      }
    }

    const formattedData: MovementDTO = {
      product_id: productId,
      type: movementType,
      quantity: data.quantity,
      notes: data.notes,
    };

    await updateMovement({ id: Number(id), movement: formattedData });
    navigate("/movements");
  }

  useEffect(() => {
    if (id) {
      fetchMovementById(Number(id));
    }
    fetchProducts({
      fields: ['id', 'reference']
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (movement) {
      reset({
        type: ensureIdArray(movement.type),
        product_id: ensureIdArray(movement.product_id?.id),
        quantity: movement.quantity,
        notes: movement.notes || ''
      });
    }
  }, [movement, reset]);

  useEffect(() => {
    const productId = getFirstId(selectedProductId);
    if (productId) {
      fetchProductById(productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  if (isLoadingMovement || isLoadingProducts) {
    return <LoadingSpinner />;
  }

  if (fetchError) {
    return <div>{t('movements.form.error_loading')}: {fetchError.message}</div>;
  }

  if (!movement) {
    return <div>{t('movements.details.not_found')}</div>;
  }

  return (
    <SimpleForm<MovementDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/movements"
      isSubmitting={isSubmitting || isLoadingMovementUpdate}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
