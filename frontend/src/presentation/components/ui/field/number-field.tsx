import { Field } from "@ui/chakra/field";
import { Controller, type FieldErrors, type FieldValues, type Path, type Control } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";
import { useTranslation } from "react-i18next";
import { NumberInputField, NumberInputRoot } from "@ui/chakra/number-input";

type NumberFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    control: Control<T>;
    errors: FieldErrors<T>;
};

export const NumberField = <T extends FieldValues, K extends Path<T>>({
    field,
    control,
    errors
}: NumberFieldProps<T, K>) => {
    const { name, label, placeholder, required, helperText, step } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    const optionalText = !required ? "(optional)" : undefined;
    const safeHelperText = helperText || '';
    const safeStep = step || 1;
    const { t } = useTranslation();

    return (
        <Field
            label={label}
            errorText={t(errorText)}
            invalid={isInvalid}
            optionalText={optionalText}
            helperText={t(safeHelperText)}
        >
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <NumberInputRoot
                        disabled={field.disabled}
                        name={field.name}
                        value={field.value}
                        step={safeStep}
                        onValueChange={({ value }) => {
                            field.onChange(value)
                        }}
                        w="full"
                    >
                        <NumberInputField placeholder={placeholder} onBlur={field.onBlur} />
                    </NumberInputRoot>
                )}
            />
        </Field>
    );
};