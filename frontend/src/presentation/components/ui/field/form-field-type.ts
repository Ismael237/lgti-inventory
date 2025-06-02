import type { RefObject } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";

export type FieldType = 'text' | 'textarea' | 'select' | 'switch' | 'checkbox' | 'number';

export interface FieldConfig<T extends FieldValues, K extends Path<T>> {
  name: K;
  label: string;
  type: T[K] extends boolean ? 'switch' | 'checkbox' :
  T[K] extends number ? 'number' | 'select' :
  T[K] extends string ? 'text' | 'textarea' | 'select' | 'date' :
  T[K] extends number | null ? 'select' :
  FieldType;
  placeholder?: string;
  helperText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  required?: boolean;
  defaultValue?: PathValue<T, K>;
  contentRef?: RefObject<HTMLElement>;
  multiple?: boolean;
  step?: number;
}

export function makeField<T extends FieldValues>() {
  return <K extends Path<T>>(field: FieldConfig<T, K>) => field;
}