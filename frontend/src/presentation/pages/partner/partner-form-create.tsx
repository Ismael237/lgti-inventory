import { useEffect, type RefObject } from 'react';
import { partnerSchema, type PartnerDTO, type PartnerDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { usePartners } from '@hooks/use-partners';
import { usePartnerTypes } from '@hooks/use-partner-types';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate } from 'react-router-dom';

export const PartnerFormCreate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    createPartnerRequest,
  } = usePartners();

  const {
    fetchPartnerTypesRequest,
  } = usePartnerTypes();

  const {
    data: partnerTypes,
    execute: fetchPartnerTypes,
    isLoading: isLoadingPartnerTypes
  } = fetchPartnerTypesRequest;

  const {
    execute: createPartner,
    isLoading: isLoadingPartnerCreation
  } = createPartnerRequest;

  useEffect(() => {
    fetchPartnerTypes();
  
  }, []);

  const safePartnerTypes = partnerTypes ?? [];

  const partnerTypeOptions = createListCollection({
    items: safePartnerTypes.map(type => ({ value: type.id, label: type.type_name }))
  });

  const field = makeField<PartnerDTOForm>();

  const fields = [
    field({
      name: 'name' as const,
      label: t('partners.form.name'),
      type: 'text' as const,
      placeholder: t('partners.form.name_placeholder'),
      required: true
    }),
    field({
      name: 'contact_email' as const,
      label: t('partners.form.email'),
      type: 'text' as const,
      placeholder: t('partners.form.email_placeholder'),
      required: true
    }),
    field({
      name: 'partner_type' as const,
      label: t('partners.form.type'),
      type: 'select' as const,
      placeholder: t('partners.form.type_placeholder'),
      contentRef: selectRef,
      required: true,
      multiple: true,
      options: partnerTypeOptions,
    }),
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PartnerDTOForm>({
    resolver: zodResolver(partnerSchema)
  });

  const onSubmit = async (data: PartnerDTOForm) => {
    
    const formattedData: PartnerDTO = {
      name: data.name,
      contact_email: data.contact_email,
      partner_type: data.partner_type.map(type => ({ partner_type_id: type })),
    };
    
    await createPartner(formattedData);
    navigate("/partners");
  }

  if (isLoadingPartnerTypes) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleForm<PartnerDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/partners"
      isSubmitting={isSubmitting || isLoadingPartnerCreation}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
