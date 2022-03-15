import React from "react";
import { tw } from "twind";

import { InfoIcon, LayersIcon } from "./icons";

export const Button = (props) => {
  return (
    <button
      type="button"
      className={tw`px-4 py-2 bg-red-100 rounded-md hover:bg-red-200 text-red-800 focus:outline-none focus:ring cursor-pointer text-md`}
      {...props}
    />
  );
};

export const IconButton = (props) => {
  return (
    <button
      type="button"
      className={tw`flex gap-2 align-middle p-2 font-medium tracking-wide capitalize transition-colors duration-200 transform bg-white-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 border border-blue-600 text-blue-600 hover:border-blue-500`}
      {...props}
    />
  );
};

export const CloseButton = (props?) => (
  <button
    className={tw`absolute top-0 right-0 h-12 w-12 bg-red-100 cursor-pointer hover:bg-red-200 text-red-800 text-lg`}
    children="✕"
    {...props}
  />
);

export const LayersButton = (props?) => (
  <button
    className={tw`absolute top-4 left-4 rounded-lg z-10 h-12 w-12 bg-white cursor-pointer hover:bg-gray-100 text-gray-700 text-lg flex items-center justify-center`}
    {...props}
  >
    <LayersIcon />
  </button>
);

export const InfobarButton = (props?) => (
  <button
    className={tw`absolute top-4 right-4 rounded-lg z-10 h-12 w-12 bg-white cursor-pointer hover:bg-gray-100 text-gray-700 text-lg flex items-center justify-center`}
    {...props}
  >
    <InfoIcon />
  </button>
);
