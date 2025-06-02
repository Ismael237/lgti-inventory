import type { Control, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { TextareaField } from "./text-area-field";
import { SelectField } from "./select-field";
import { SwitchField } from "./switch-field";
import { CheckboxField } from "./checkbox-field";
import { NumberField } from "./number-field";
import { TextField } from "./text-field";
import type { FieldConfig } from "./form-field-type";

type FormFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>;
};

export const FormField = <T extends FieldValues, K extends Path<T>>({
    field,
    control,
    register,
    errors
}: FormFieldProps<T, K>) => {
    const { type } = field;
    
    switch (type) {
        case 'textarea':
            return <TextareaField field={field} register={register} errors={errors} />;
        case 'select':
            return <SelectField field={field} control={control} errors={errors} />;
        case 'switch':
            return <SwitchField field={field} control={control} errors={errors} />;
        case 'checkbox':
            return <CheckboxField field={field} control={control} errors={errors} />;
        case 'number':
            return <NumberField field={field} control={control} errors={errors} />;
        default:
            return <TextField field={field} register={register} errors={errors} />;
    }
};