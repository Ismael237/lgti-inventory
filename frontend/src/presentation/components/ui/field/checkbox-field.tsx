import { Checkbox } from "@ui/chakra/checkbox";
import { Field } from "@ui/chakra/field";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";

type CheckboxFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    control: Control<T>;
    errors: FieldErrors<T>;
};

export const CheckboxField = <T extends FieldValues, K extends Path<T>>({
    field,
    control,
    errors
}: CheckboxFieldProps<T, K>) => {
    const { name, label } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: controllerField }) => (
                <Field
                    errorText={errorText}
                    invalid={isInvalid}
                >
                    <Checkbox
                        id={String(name)}
                        checked={controllerField.value}
                        onCheckedChange={({ checked }) => controllerField.onChange(checked)}
                    >
                        {label}
                    </Checkbox>
                </Field>
            )}
        />
    );
};