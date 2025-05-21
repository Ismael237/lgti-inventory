import { type Control, type FieldErrors, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormField } from "@ui/field/form-field";
import { FieldsetContent, FieldsetErrorText, FieldsetRoot, Flex, HStack } from "@chakra-ui/react";
import { Button } from "@ui/chakra/button";
import { LoadingSpinner } from "@ui/loading-spinner";
import type { FieldConfig } from "@ui/field/form-field-type";


interface SimpleFormProps<T extends FieldValues> {
    fields: FieldConfig<T, Path<T>>[];
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>;
    redirectPath?: string;
    handleSubmit: () => void
    isLoadingItem?: boolean,
    isSubmitting?: boolean,
    fieldSpacing?: number;
    submitLabel?: string;
    cancelLabel?: string;
    loadingLabel?: string;
    onCancel?: () => void;
}

export function SimpleForm<T extends FieldValues>({
    fields,
    control,
    register,
    errors,
    redirectPath,
    handleSubmit,
    onCancel,
    isLoadingItem = false,
    isSubmitting = false,
    fieldSpacing = 4,
    submitLabel,
    cancelLabel,
    loadingLabel,
}: SimpleFormProps<T>) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const defaultSubmitLabel = t('form.save');
    const defaultCancelLabel = t('form.cancel');
    const defaultLoadingLabel = t('form.saving');

    const handleCancel = () => {
        if (onCancel) {
          onCancel();
        } else {
          navigate(redirectPath || "/");
        }
      };

    if (isLoadingItem) {
        return <LoadingSpinner />;
    }

    return (
        <FieldsetRoot w="full" invalid={!!errors.root}>
            <form onSubmit={handleSubmit}>
                <FieldsetContent gap={fieldSpacing}>
                    {fields.map((field, index) => (
                        <FormField
                            key={`${String(field.name)}-${index}`}
                            field={field}
                            control={control}
                            register={register}
                            errors={errors}
                        />
                    ))}
                </FieldsetContent>

                <FieldsetErrorText>
                    {t(errors.root?.message || '')}
                </FieldsetErrorText>

                <Flex width="100%" justify="flex-end" mt={6}>
                    <HStack gap={4}>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            type="button"
                        >
                            {cancelLabel || defaultCancelLabel}
                        </Button>
                        <Button
                            loading={isSubmitting}
                            type="submit"
                            loadingText={loadingLabel || defaultLoadingLabel}
                        >
                            {submitLabel || defaultSubmitLabel}
                        </Button>
                    </HStack>
                </Flex>
            </form>
        </FieldsetRoot>
    );
}