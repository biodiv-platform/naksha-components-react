import React from "react";
import { tw } from "twind";

import { LayersIcon } from "./icons";

export const Button = (props) => {
  return (
    <button
      type="button"
      className={tw`px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80`}
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
    className={tw`absolute top-0 right-0 h-12 w-12 border-b-2 border-gray-300 bg-red-50 cursor-pointer hover:bg-red-100 text-red-800 text-lg`}
    children="✕"
    {...props}
  />
);

export const LayersButton = (props?) => (
  <button
    className={tw`absolute top-4 left-4 rounded-lg z-10 h-12 w-12 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-lg flex items-center justify-center`}
    {...props}
  >
    <LayersIcon />
  </button>
);
