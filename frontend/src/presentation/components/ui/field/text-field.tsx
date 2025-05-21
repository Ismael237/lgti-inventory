import { Input } from "@chakra-ui/react";
import { Field } from "@ui/chakra/field";
import type { FieldValues, FieldErrors, Path, UseFormRegister } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";
import { useTranslation } from "react-i18next";

type TextFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
};

export const TextField = <T extends FieldValues, K extends Path<T>>({
    field,
    register,
    errors
}: TextFieldProps<T, K>) => {
    const { t } = useTranslation();
    const { name, label, placeholder, required, helperText } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    const optionalText = !required ? "(optional)" : undefined;
    const safeHelperText = helperText || '';
    
    return (
        <Field
            label={label}
            errorText={t(errorText)}
            invalid={isInvalid}
            optionalText={optionalText}
            helperText={t(safeHelperText)}
        >
            <Input
                placeholder={placeholder}
                {...register(name, { required: required ? `${label} est requis` : false })}
            />
        </Field>
    );
};