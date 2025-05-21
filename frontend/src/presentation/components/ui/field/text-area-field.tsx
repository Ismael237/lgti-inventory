import { Textarea } from "@chakra-ui/react";
import { Field } from "@ui/chakra/field";
import type { FieldValues, Path, UseFormRegister, FieldErrors } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";
import { useTranslation } from "react-i18next";

type TextareaFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
};

export const TextareaField = <T extends FieldValues, K extends Path<T>>({
    field,
    register,
    errors
}: TextareaFieldProps<T, K>) => {
    const { t } = useTranslation();
    const { name, label, placeholder, required } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    const optionalText = !required ? "(optional)" : undefined;
    
    return (
        <Field
            label={label}
            errorText={t(errorText)}
            invalid={isInvalid}
            optionalText={optionalText}
        >
            <Textarea
                placeholder={placeholder}
                {...register(name, { required: required ? `${label} est requis` : false })}
            />
        </Field>
    );
};