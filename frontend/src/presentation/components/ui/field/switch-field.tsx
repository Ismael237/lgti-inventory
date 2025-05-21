import { Switch } from "@ui/chakra/switch";
import { Field } from "@ui/chakra/field";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import { LuCheck, LuX } from "react-icons/lu";
import type { FieldConfig } from "./form-field-type";

type SwitchFieldProps<T extends FieldValues, K extends Path<T>> = {
    field: FieldConfig<T, K>;
    control: Control<T>;
    errors: FieldErrors<T>;
};

export const SwitchField = <T extends FieldValues, K extends Path<T>>({
    field,
    control,
    errors
}: SwitchFieldProps<T, K>) => {
    const { name, label, required } = field;
    const errorText = errors[name]?.message as string;
    const isInvalid = !!errors[name];
    const optionalText = !required ? "(optional)" : undefined;
    
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: controllerField }) => (
                <Field
                    label={label}
                    errorText={errorText}
                    invalid={isInvalid}
                    optionalText={optionalText}
                >
                    <Switch
                        id={String(name)}
                        name={controllerField.name}
                        checked={controllerField.value}
                        onCheckedChange={({ checked }) => controllerField.onChange(checked)}
                        label={label}
                        thumbLabel={{
                            on: <LuCheck />,
                            off: <LuX />,
                        }}
                        inputProps={{
                            onBlur: controllerField.onBlur,
                        }}
                    >
                        {label}
                    </Switch>
                </Field>
            )}
        />
    );
};