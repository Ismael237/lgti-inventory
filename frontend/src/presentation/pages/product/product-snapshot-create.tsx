import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Text,
    Stack,
} from '@chakra-ui/react';

import { useSnapshotEvents } from '@hooks/use-snapshot-events';
import { makeField } from '@ui/field/form-field-type';
import { SimpleForm } from '@ui/form/simple-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { snapshotEventSchema, type SnapshotEventDTOForm, type SnapshotEventDTO } from '@entities';

export const ProductSnapshotCreate = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        createSnapshotEventRequest,
    } = useSnapshotEvents();

    const {
        execute: createSnapshotEvent,
        isLoading
    } = createSnapshotEventRequest;

    const field = makeField<SnapshotEventDTOForm>();

    const fields = [
        field({
            name: 'label' as const,
            label: t('products.snapshots.create.label_label'),
            type: 'text' as const,
            placeholder: t('products.snapshots.create.label_placeholder'),
            required: false
        }),
        field({
            name: 'notes' as const,
            label: t('products.snapshots.create.description_label'),
            type: 'textarea' as const,
            placeholder: t('products.snapshots.create.description_placeholder'),
            required: false
        })
    ];

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<SnapshotEventDTOForm>({
        resolver: zodResolver(snapshotEventSchema)
    });

    const onSubmit = async ({ label, notes }: SnapshotEventDTOForm) => {
        const formattedData: SnapshotEventDTO = {
            label,
            notes,
        };

        const snapshot = await createSnapshotEvent(formattedData);
        navigate(`/products/snapshots/${snapshot.id}`);
    };

    return (
        <Stack gap={4}>
            <Text color="gray.600">
                {t('products.snapshots.create.description')}
            </Text>

            <SimpleForm<SnapshotEventDTOForm>
                fields={fields}
                control={control}
                register={register}
                errors={errors}
                redirectPath="/products/snapshots"
                cancelLabel={t('common.back')}
                isSubmitting={isSubmitting || isLoading}
                handleSubmit={handleSubmit(onSubmit)}
                submitLabel={t('products.snapshots.create.submit')}
                loadingLabel={t('products.snapshots.create.loading')}
            />
        </Stack>
    );
};
