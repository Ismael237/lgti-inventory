import { useEffect, type RefObject } from 'react';
import { partnerSchema, type PartnerDTO, type PartnerDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { usePartners } from '@hooks/use-partners';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { ensureIdArray } from '@utils/id-helper';
import { usePartnerTypes } from '@hooks/use-partner-types';

export const PartnerFormUpdate = ({ selectRef }: { selectRef: RefObject<HTMLElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    fetchPartnerByIdRequest,
    updatePartnerRequest,
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
    execute: fetchPartnerById,
    data: partner,
    error: fetchError,
    isLoading: isLoadingPartner
  } = fetchPartnerByIdRequest;

  const {
    execute: updatePartner,
    isLoading: isLoadingPartnerUpdate
  } = updatePartnerRequest;

  useEffect(() => {
    if (id) {
      fetchPartnerById(Number(id));
    }
    fetchPartnerTypes();
  
  }, [id]);

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
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PartnerDTOForm>({
    resolver: zodResolver(partnerSchema)
  });

  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name,
        contact_email: partner.contact_email,
        partner_type: ensureIdArray(partner.partner_type?.map(type => type.partner_type_id.id)),
      });
    }
  }, [partner, reset]);

  const onSubmit = async (data: PartnerDTOForm) => {
    if (!id) return;

    const formattedData: PartnerDTO = {
      name: data.name,
      contact_email: data.contact_email,
      partner_type: data.partner_type.map(type => ({ partner_type_id: type })),
    };
    
    await updatePartner({ id: Number(id), partner: formattedData });
    navigate("/partners");
  }

  if (isLoadingPartner || isLoadingPartnerTypes) {
    return <LoadingSpinner />;
  }

  if (fetchError) {
    return <div>{t('partners.form.error_loading', { error: fetchError.message })}</div>;
  }

  if (!partner) {
    return <div>{t('partners.form.not_found')}</div>;
  }

  return (
    <SimpleForm<PartnerDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/partners"
      isSubmitting={isSubmitting || isLoadingPartnerUpdate}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
