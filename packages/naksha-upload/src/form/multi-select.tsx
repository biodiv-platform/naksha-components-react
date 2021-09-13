import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import React from "react";
import { useController } from "react-hook-form";
import { MultiSelect } from "react-multi-select-component";

const MultiSelectBox = styled.div`
  .multi-select {
    max-width: 100%;
  }
`;

interface SelectMultipleFieldProps {
  name: string;
  label: string;
  options: any[];
  hint?: string;
}

export default function SelectMultipleField({
  name,
  label,
  options,
  hint,
}: SelectMultipleFieldProps) {
  const { field, fieldState } = useController({ name });

  return (
    <FormControl isInvalid={fieldState.invalid}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <MultiSelectBox>
        <MultiSelect
          labelledBy={name}
          onChange={field.onChange}
          options={options}
          value={field.value}
        />
      </MultiSelectBox>
      <FormErrorMessage children={fieldState?.error?.message} />
      {hint && <FormHelperText>{hint}</FormHelperText>}
    </FormControl>
  );
}
