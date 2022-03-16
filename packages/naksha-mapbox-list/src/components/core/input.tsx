import React from "react";
import { tw } from "twind";

import { SearchIcon } from "./icons";

interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  name?: string;
}

export const Input = (props: InputProps) => (
  <div>
    {props.label && (
      <label className={tw`text-gray-700`} htmlFor={props.name}>
        {props.label}
      </label>
    )}
    <input
      id={props.name}
      type="text"
      name={props.name}
      className={tw`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring`}
      {...props}
    />
  </div>
);

export const SelectInput = (props: InputProps) => (
  <div>
    {props.label && (
      <label className={tw`text-gray-700`} htmlFor={props.name}>
        {props.label}
      </label>
    )}
    <select
      id={props.name}
      name={props.name}
      className={tw`block w-full px-4 py-2 mt-2 text-gray-700 border bg-white border-gray-200 rounded-md focus:outline-none focus:ring appearance-none text-base`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "16px 12px",
        backgroundRepeat: "no-repeat",
      }}
      {...props}
    />
  </div>
);

export const SearchInput = (props: InputProps) => (
  <div className="relative">
    <span className={tw`absolute inset-y-0 left-0 flex items-center pl-3`}>
      <SearchIcon />
    </span>
    <input
      type="search"
      className={tw`w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 text-base rounded-md focus:outline-none focus:ring`}
      {...props}
    />
  </div>
);

interface CheckboxInputProps extends InputProps {
  isLoading?: boolean;
}

export const CheckboxInput = (props: CheckboxInputProps) =>
  props.isLoading ? (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 20 20"
      version="1.1"
      className={tw`inline text-gray-200 animate-spin dark:text-gray-600`}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g fill="#212121" fillRule="nonzero">
          <path d="M10,3 C6.13401,3 3,6.13401 3,10 C3,10.2761 2.77614,10.5 2.5,10.5 C2.22386,10.5 2,10.2761 2,10 C2,5.58172 5.58172,2 10,2 C14.4183,2 18,5.58172 18,10 C18,14.4183 14.4183,18 10,18 C9.72386,18 9.5,17.7761 9.5,17.5 C9.5,17.2239 9.72386,17 10,17 C13.866,17 17,13.866 17,10 C17,6.13401 13.866,3 10,3 Z"></path>
        </g>
      </g>
    </svg>
  ) : (
    <input
      type="checkbox"
      className={tw`w-5 h-5 border-gray-100 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80`}
      name={props.name}
      checked={props.checked}
      onChange={props.onChange}
    />
  );
