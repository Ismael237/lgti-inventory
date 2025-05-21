import { useEffect } from 'react';
import { priceSimulationSchema, type PriceSimulationDTO, type PriceSimulationDTOForm} from '@entities';
import { useTranslation } from 'react-i18next';
import { usePriceSimulations } from '@hooks/use-price-simulations';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from '@ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';

export const PriceSimulationFormUpdate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    fetchPriceSimulationByIdRequest,
    updatePriceSimulationRequest,
  } = usePriceSimulations();

  const {
    execute: fetchPriceSimulationById,
    data: simulation,
    error: fetchError,
    isLoading: isLoadingSimulation
  } = fetchPriceSimulationByIdRequest;

  const {
    execute: updatePriceSimulation,
    isLoading: isLoadingSimulationUpdate
  } = updatePriceSimulationRequest;

  useEffect(() => {
    if (id) {
      fetchPriceSimulationById(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PriceSimulationDTOForm>({
    resolver: zodResolver(priceSimulationSchema),
  });

  useEffect(() => {
    if (simulation) {
      reset({
        scenario_name: simulation.scenario_name,
        factor: simulation.factor,
      });
    }
  }, [simulation, reset]);

  const onSubmit = async ({ scenario_name, factor }: PriceSimulationDTOForm) => {
    if (!id) return;

    const formattedData: PriceSimulationDTO = {
      scenario_name,
      factor,
    };

    await updatePriceSimulation({ id: Number(id), priceSimulation: formattedData });
    navigate("/price-simulations");
  }

  if (isLoadingSimulation) {
    return <LoadingSpinner />;
  }

  if (fetchError) {
    return <div>{t('price_simulations.form.error_loading')}: {fetchError.message}</div>;
  }

  if (!simulation) {
    return <div>{t('price_simulations.details.not_found')}</div>;
  }

  return (
    <SimpleForm<PriceSimulationDTOForm>
      fields={fields}
      control={control}
      register={register}
      errors={errors}
      redirectPath="/price-simulations"
      isSubmitting={isSubmitting || isLoadingSimulationUpdate}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};
