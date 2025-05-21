import { Field } from "@ui/chakra/field";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@ui/chakra/select";
import { Controller, type Control, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import type { FieldConfig } from "./form-field-type";
import { useTranslation } from "react-i18next";

type SelectFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    control: Control<T>;
    errors: FieldErrors<T>;
};

export const SelectField = <T extends FieldValues, K extends Path<T>>({
    field,
    control,
    errors
}: SelectFieldProps<T, K>) => {
    const { t } = useTranslation();
    const { name, label, placeholder, required, options, contentRef, helperText} = field;
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
            <Controller
                control={control}
                name={name}
                render={({ field: controllerField }) => {
                    return (
                        <SelectRoot
                            name={controllerField.name}
                            value={controllerField.value}
                            onValueChange={({ value }) => controllerField.onChange(value)}
                            onInteractOutside={() => controllerField.onBlur()}
                            collection={options!}
                            colorPalette="brand"
                        >
                            <SelectTrigger clearable>
                                <SelectValueText placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent portalRef={contentRef}>
                                {options?.items.map(option => (
                                    <SelectItem key={String(option.value)} item={option}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    );
                }}
            />
        </Field>
    );
};