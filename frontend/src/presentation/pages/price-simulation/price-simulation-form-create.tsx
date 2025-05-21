import { priceSimulationSchema, type PriceSimulationDTO, type PriceSimulationDTOForm } from '@entities';
import { useTranslation } from 'react-i18next';
import { usePriceSimulations } from '@hooks/use-price-simulations';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

export const PriceSimulationFormCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    createPriceSimulationRequest,
  } = usePriceSimulations();

  const {
    execute: createPriceSimulation,
    isLoading: isLoadingSimulationCreation
  } = createPriceSimulationRequest;

  const field = makeField<PriceSimulationDTOForm>();

  const fields = [
    field({
      name: 'scenario_name' as const,
      label: t('price_simulations.form.scenario_name'),
      type: 'text' as const,
      placeholder: t('price_simulations.form.scenario_name_placeholder'),
      required: true
    }),
    field({
      name: 'factor' as const,
      label: t('price_simulations.form.factor'),
      type: 'number' as const,
      placeholder: t('price_simulations.form.factor_placeholder'),
      required: true
    }),
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PriceSimulationDTOForm>({
    resolver: zodResolver(priceSimulationSchema)
  });

  const onSubmit = async ({ scenario_name, factor }: PriceSimulationDTOForm) => {
    const formattedData: PriceSimulationDTO = {
      scenario_name,
      factor,
    };
    
    await createPriceSimulation(formattedData);
    navigate("/price-simulations");
  }

  return (
    <SimpleForm<PriceSimulationDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/price-simulations"
      isSubmitting={isSubmitting || isLoadingSimulationCreation}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};