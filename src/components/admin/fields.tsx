"use client";

import { Field, Input, Textarea } from "@chakra-ui/react";

type BaseProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
};

export function TextField({
  label,
  value,
  onChange,
  helper,
  placeholder,
  required,
  type = "text",
  autoComplete,
}: BaseProps) {
  return (
    <Field.Root required={required}>
      <Field.Label>
        {label}
        {required && <Field.RequiredIndicator />}
      </Field.Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <Field.HelperText>{helper}</Field.HelperText>}
    </Field.Root>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  helper,
  placeholder,
  rows = 4,
}: Omit<BaseProps, "type"> & { rows?: number }) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <Field.HelperText>{helper}</Field.HelperText>}
    </Field.Root>
  );
}
