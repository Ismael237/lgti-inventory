import { useEffect, type RefObject } from 'react';
import { movementSchema, MovementType, type MovementDTO, type MovementDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { useMovements } from '@hooks/use-movements';
import { useProducts } from '@hooks/use-products';
import { usePartners } from '@hooks/use-partners';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { getFirstId } from '@utils/id-helper';

export const MovementFormCreate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    createMovementRequest,
  } = useMovements();

  const {
    fetchProductsRequest,
    fetchProductByIdRequest,
  } = useProducts();
  
  const {
    fetchPartnersRequest
  } = usePartners();

  const {
    data: products,
    execute: fetchProducts,
    isLoading: isLoadingProducts
  } = fetchProductsRequest;
  
  const {
    data: partners,
    execute: fetchPartners,
    isLoading: isLoadingPartners
  } = fetchPartnersRequest;

  const {
    execute: createMovement,
    isLoading: isLoadingMovementCreation
  } = createMovementRequest;

  const {
    data: product,
    isLoading: isLoadingProduct,
    execute: fetchProductById,
  } = fetchProductByIdRequest;

  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MovementDTOForm>({
    resolver: zodResolver(movementSchema)
  });

  const selectedProductId = watch('product_id');
  const selectedMovementType = watch('type');

  const safeProducts = products ?? [];
  const safePartners = partners ?? [];

  const productOptions = createListCollection({
    items: safeProducts.map(product => ({ value: product.id, label: product.reference }))
  });
  
  const partnerOptions = createListCollection({
    items: safePartners.map(partner => ({ value: partner.id, label: partner.name }))
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

    if (product === null) {
      return t('movements.form.stock_unavailable');
    }

    if (movementType === MovementType.OUT) {
      return t('movements.form.available_stock_out', {
        available: product.current_stock,
      });
    } else if (movementType === MovementType.IN) {
      return t('movements.form.current_stock_in', {
        current: product.current_stock,
      });
    }

    return t('movements.form.current_stock', {
      current: product.current_stock,
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
      name: 'partner_id' as const,
      label: t('movements.form.partner'),
      type: 'select' as const,
      placeholder: t('movements.form.partner_placeholder'),
      contentRef: selectRef,
      required: true,
      multiple: false,
      options: partnerOptions,
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
    const productId = getFirstId(data.product_id);
    const partnerId = getFirstId(data.partner_id);
    const movementType = getFirstId(data.type);

    if (!productId) throw Error(t('movements.form.product_missing'));
    if (!partnerId) throw Error(t('movements.form.partner_missing'));
    if (!movementType) throw Error(t('movements.form.type_missing'));

    if (movementType === MovementType.OUT) {
      const currentStock = (await fetchProductById(productId))?.current_stock;

      if (currentStock !== undefined && currentStock < data.quantity) {
        setError("quantity", {
          type: "manual",
          message: t('movements.form.out_of_stock', {
            available: currentStock,
            requested: data.quantity
          })
        });
        return;
      }
    }

    const formattedData: MovementDTO = {
      product_id: productId,
      partner_id: partnerId,
      type: movementType,
      quantity: data.quantity,
      notes: data.notes,
    };

    await createMovement(formattedData);
    navigate("/movements");
  }


  useEffect(() => {
    fetchProducts({
      fields: ['id', 'reference']
    });
    fetchPartners();

  }, []);

  useEffect(() => {
    const productId = getFirstId(selectedProductId);
    if (productId) {
      fetchProductById(productId);
    }

  }, [selectedProductId]);

  if (isLoadingProducts || isLoadingPartners) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleForm<MovementDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/movements"
      isSubmitting={isSubmitting || isLoadingMovementCreation}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
