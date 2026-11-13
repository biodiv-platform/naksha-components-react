import React from "react";
import { tw } from "twind";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  title?: string;
  id?: string;
}

export const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  title,
  id,
}: SwitchProps) => {
  return (
    <label
      htmlFor={id}
      title={title}
      className={tw`inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {label && (
        <span className={tw`text-sm text-gray-600 font-normal`}>{label}</span>
      )}
      <span className={tw`relative inline-flex items-center`}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className={tw`sr-only`}
        />
        <div
          className={tw`w-8 h-4 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? "bg-blue-600" : "bg-gray-300"
          }`}
        />
        <div
          className={tw`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? "transform translate-x-4" : ""
          }`}
        />
      </span>
    </label>
  );
};
