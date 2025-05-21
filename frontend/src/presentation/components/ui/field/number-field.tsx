import { Input } from "@chakra-ui/react";
import { Field } from "@ui/chakra/field";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";
import { useTranslation } from "react-i18next";

type NumberFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
};

export const NumberField = <T extends FieldValues, K extends Path<T>>({
    field,
    register,
    errors
}: NumberFieldProps<T, K>) => {
    const { name, label, placeholder, required, helperText } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    const optionalText = !required ? "(optional)" : undefined;
    const safeHelperText = helperText || '';
    const { t } = useTranslation();
    
    return (
        <Field
            label={label}
            errorText={t(errorText)}
            invalid={isInvalid}
            optionalText={optionalText}
            helperText={t(safeHelperText)}
        >
            <Input
                type="number"
                placeholder={placeholder}
                step="0.01"
                {...register(name, {
                    valueAsNumber: true,
                    required: required ? `${label} est requis` : false
                })}
            />
        </Field>
    );
};